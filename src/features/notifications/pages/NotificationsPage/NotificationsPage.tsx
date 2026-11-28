import { useState } from 'react';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import { AllCaughtUp } from '../../components/AllCaughtUp/AllCaughtUp';
import { NotificationFilters } from '../../components/NotificationFilters/NotificationFilters';
import { LoadMore, NotificationList } from '../../components/NotificationList/NotificationList';
import { NotificationsHeader } from '../../components/NotificationsHeader/NotificationsHeader';
import { NotificationTabs } from '../../components/NotificationTabs/NotificationTabs';
import { useOpenNotification } from '../../hooks/useOpenNotification';
import { notificationsTexts as t } from '../../notifications.labels';
import { useNotifications } from '../../notifications.queries';
import type { NotificationFilter } from '../../notifications.types';
import styles from './NotificationsPage.module.css';

type NotificationsQuery = ReturnType<typeof useNotifications>;

function NotificationsContent({ query }: { query: NotificationsQuery }) {
  const { open, markAsRead } = useOpenNotification();
  if (query.isPending) return <LoadingState message={t.loading} />;
  if (query.isError) return <ErrorState title={t.loadError} message="" />;
  const items = query.data.pages.flatMap((page) => page.data);
  const allRead = query.data.pages[0]?.meta.counts.UNREAD === 0;
  if (items.length === 0) return <AllCaughtUp title={t.empty} message={t.emptyHint} />;
  return (
    <>
      {allRead && <AllCaughtUp title={t.allCaughtUp} message={t.allCaughtUpHint} />}
      <NotificationList items={items} allRead={allRead} onOpen={open} onMarkAsRead={markAsRead} />
      {query.hasNextPage && (
        <LoadMore isLoading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} />
      )}
    </>
  );
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const query = useNotifications(filter);
  const counts = query.data?.pages[0]?.meta.counts;
  return (
    <div className={styles.page}>
      <NotificationsHeader unread={counts?.UNREAD} />
      <NotificationTabs unread={counts?.UNREAD} />
      <NotificationFilters active={filter} counts={counts} onChange={setFilter} />
      <NotificationsContent query={query} />
    </div>
  );
}
