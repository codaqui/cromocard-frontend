import { useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { useNotificationsSocket } from '../../hooks/useNotificationsSocket';
import { useOpenNotification } from '../../hooks/useOpenNotification';
import { compactTime, displayMessage } from '../../notifications.format';
import { categoryIcons } from '../../notifications.icons';
import { notificationsTexts as t, typeLabelOf } from '../../notifications.labels';
import type { Notification } from '../../notifications.types';
import styles from './NotificationToasts.module.css';

export const MAX_TOASTS = 3;

interface ToastActions {
  onOpen: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
  onClose: (notification: Notification) => void;
}

function ToastHeader({
  notification,
  onClose,
}: Pick<ToastActions, 'onClose'> & { notification: Notification }) {
  return (
    <div className={styles.header}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={categoryIcons[notification.category]} size={16} />
      </span>
      <span className={styles.label}>{typeLabelOf(notification.type).label}</span>
      <time className={styles.time} dateTime={notification.createdAt}>
        {compactTime(notification.createdAt)}
      </time>
      <button
        type="button"
        className={styles.close}
        aria-label={t.close}
        onClick={() => onClose(notification)}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

type ToastProps = ToastActions & { notification: Notification };

function ToastButtons({ notification, onOpen, onMarkAsRead }: Omit<ToastProps, 'onClose'>) {
  return (
    <div className={styles.actions}>
      {notification.referenceLink && (
        <button type="button" className={styles.primary} onClick={() => onOpen(notification)}>
          {typeLabelOf(notification.type).action}
        </button>
      )}
      <button type="button" className={styles.secondary} onClick={() => onMarkAsRead(notification)}>
        {t.markAsRead}
      </button>
    </div>
  );
}

function NotificationToast({ notification, onClose, ...actions }: ToastProps) {
  return (
    <article
      className={cn(styles.toast, styles[notification.category])}
      aria-label={notification.title}
    >
      <ToastHeader notification={notification} onClose={onClose} />
      <p className={styles.title}>{notification.title}</p>
      <p className={styles.message}>{displayMessage(notification)}</p>
      <ToastButtons notification={notification} {...actions} />
    </article>
  );
}

function useToastStack() {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const { open, markAsRead } = useOpenNotification();
  const close = ({ id }: Notification) =>
    setToasts((current) => current.filter((item) => item.id !== id));
  useNotificationsSocket((notification) =>
    setToasts((current) => [notification, ...current].slice(0, MAX_TOASTS)),
  );
  const closeThen =
    (action: (notification: Notification) => void) => (notification: Notification) => {
      close(notification);
      action(notification);
    };
  const actions: ToastActions = {
    onClose: close,
    onOpen: closeThen(open),
    onMarkAsRead: closeThen(markAsRead),
  };
  return { toasts, actions };
}

export function NotificationToasts() {
  const { toasts, actions } = useToastStack();
  return (
    <section className={styles.stack} aria-label={t.bellTitle} aria-live="polite">
      {toasts.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} {...actions} />
      ))}
    </section>
  );
}
