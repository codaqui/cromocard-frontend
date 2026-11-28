import { useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { relativeTime } from '../../notifications.format';
import { categoryIcons } from '../../notifications.icons';
import { notificationsTexts, typeLabelOf } from '../../notifications.labels';
import type { Notification } from '../../notifications.types';
import { NotificationMenu } from '../NotificationMenu/NotificationMenu';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
}

function NotificationMeta({ notification }: { notification: Notification }) {
  const { label } = typeLabelOf(notification.type);
  return (
    <p className={styles.meta}>
      <span className={styles.label}>{label}</span>
      <span
        className={cn(styles.dot, !notification.isRead && styles.unreadDot)}
        aria-label={notification.isRead ? undefined : 'Não lida'}
        role={notification.isRead ? undefined : 'img'}
      />
      <time dateTime={notification.createdAt}>{relativeTime(notification.createdAt)}</time>
    </p>
  );
}

function NotificationBody({
  notification,
  onOpen,
  titleId,
}: Omit<NotificationItemProps, 'onMarkAsRead'> & { titleId: string }) {
  const { action } = typeLabelOf(notification.type);
  return (
    <div className={styles.body}>
      <NotificationMeta notification={notification} />
      <h3 id={titleId} className={styles.title}>
        <button type="button" className={styles.titleButton} onClick={() => onOpen(notification)}>
          {notification.title}
        </button>
      </h3>
      <p className={styles.message}>{notification.message}</p>
      {notification.referenceLink && (
        <button type="button" className={styles.action} onClick={() => onOpen(notification)}>
          <Icon name="openInNew" size={16} />
          {action}
        </button>
      )}
    </div>
  );
}

interface NotificationControlsProps {
  isRead: boolean;
  onMarkAsRead: () => void;
}

function NotificationControls({ isRead, onMarkAsRead }: NotificationControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.control}
        aria-label={notificationsTexts.markAsRead}
        disabled={isRead}
        onClick={onMarkAsRead}
      >
        <Icon name="checkCircleOutline" size={20} />
      </button>
      <NotificationMenu isRead={isRead} onMarkAsRead={onMarkAsRead} />
    </div>
  );
}

export function NotificationItem({ notification, onOpen, onMarkAsRead }: NotificationItemProps) {
  const markAsRead = () => onMarkAsRead(notification);
  const titleId = useId();
  return (
    <article
      className={cn(styles.item, !notification.isRead && styles.unread)}
      aria-labelledby={titleId}
    >
      <span className={styles.avatar} aria-hidden="true">
        <Icon name={categoryIcons[notification.category]} size={24} />
      </span>
      <NotificationBody notification={notification} onOpen={onOpen} titleId={titleId} />
      <NotificationControls isRead={notification.isRead} onMarkAsRead={markAsRead} />
    </article>
  );
}
