import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { displayMessage, relativeTime } from '../../notifications.format';
import { categoryIcons } from '../../notifications.icons';
import { typeLabelOf } from '../../notifications.labels';
import type { Notification } from '../../notifications.types';
import styles from './NotificationBell.module.css';

interface BellItemProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}

function BellItemBody({ notification, onOpen }: BellItemProps) {
  const open = () => onOpen(notification);
  return (
    <div className={styles.itemBody}>
      <button type="button" className={styles.itemTitle} onClick={open}>
        {notification.title}
      </button>
      <p className={styles.itemMessage}>{displayMessage(notification)}</p>
      <time className={styles.itemTime} dateTime={notification.createdAt}>
        {relativeTime(notification.createdAt, new Date(), true)}
      </time>
      {notification.referenceLink && (
        <button type="button" className={styles.itemAction} onClick={open}>
          {typeLabelOf(notification.type).action}
        </button>
      )}
    </div>
  );
}

export function BellItem({ notification, onOpen }: BellItemProps) {
  return (
    <li className={cn(styles.item, !notification.isRead && styles.unread)}>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name={categoryIcons[notification.category]} size={18} />
      </span>
      <BellItemBody notification={notification} onOpen={onOpen} />
      {!notification.isRead && (
        <span className={styles.unreadDot} role="img" aria-label="Não lida" />
      )}
    </li>
  );
}
