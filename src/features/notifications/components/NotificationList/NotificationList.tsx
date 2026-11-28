import { Button } from '@/components/Button/Button';

import { groupByDay, type NotificationGroup } from '../../notifications.format';
import { notificationsTexts as t } from '../../notifications.labels';
import type { Notification } from '../../notifications.types';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import styles from './NotificationList.module.css';

const GROUP_TITLES: Record<NotificationGroup, string> = { TODAY: t.today, EARLIER: t.earlier };

interface NotificationListProps {
  items: Notification[];
  allRead: boolean;
  onOpen: (notification: Notification) => void;
  onMarkAsRead: (notification: Notification) => void;
}

export function NotificationList({ items, allRead, onOpen, onMarkAsRead }: NotificationListProps) {
  return groupByDay(items, { allRead }).map(({ group, items: grouped }) => (
    <section key={group} className={styles.group} aria-label={GROUP_TITLES[group]}>
      <h2 className={styles.title}>
        {GROUP_TITLES[group]}
        {group === 'TODAY' && <span className={styles.dot} aria-hidden="true" />}
      </h2>
      {grouped.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onOpen={onOpen}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </section>
  ));
}

interface LoadMoreProps {
  isLoading: boolean;
  onClick: () => void;
}

export function LoadMore({ isLoading, onClick }: LoadMoreProps) {
  return (
    <Button variant="secondary" className={styles.loadMore} disabled={isLoading} onClick={onClick}>
      {t.loadMore}
    </Button>
  );
}
