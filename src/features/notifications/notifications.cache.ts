import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type {
  Notification,
  NotificationCounts,
  NotificationFilter,
  NotificationsPage,
} from './notifications.types';

export type NotificationsListData = InfiniteData<NotificationsPage, string | undefined>;

export const notificationsKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationsKeys.all, 'list'] as const,
  list: (filter: NotificationFilter, limit: number) =>
    [...notificationsKeys.lists(), { filter, limit }] as const,
  preferences: () => [...notificationsKeys.all, 'preferences'] as const,
};

const LISTS_EVERY_INCOMING: readonly NotificationFilter[] = ['ALL', 'UNREAD'];

const matches = (filter: NotificationFilter, notification: Notification) =>
  LISTS_EVERY_INCOMING.includes(filter) || filter === notification.category;

function countedIn(counts: NotificationCounts, notification: Notification): NotificationCounts {
  return {
    ...counts,
    ALL: counts.ALL + 1,
    UNREAD: counts.UNREAD + 1,
    [notification.category]: counts[notification.category] + 1,
  };
}

function withIncoming(
  data: NotificationsListData,
  notification: Notification,
  listed: boolean,
): NotificationsListData {
  const pages = data.pages.map((page, index) => ({
    meta: { ...page.meta, counts: countedIn(page.meta.counts, notification) },
    data: listed && index === 0 ? [notification, ...page.data] : page.data,
  }));
  return { ...data, pages };
}

const alreadyListed = (data: NotificationsListData, id: string) =>
  data.pages.some((page) => page.data.some((item) => item.id === id));

export function addIncomingNotification(queryClient: QueryClient, notification: Notification) {
  queryClient
    .getQueriesData<NotificationsListData>({ queryKey: notificationsKeys.lists() })
    .forEach(([queryKey, data]) => {
      if (!data || alreadyListed(data, notification.id)) return;
      const [, , { filter }] = queryKey as ReturnType<typeof notificationsKeys.list>;
      queryClient.setQueryData(
        queryKey,
        withIncoming(data, notification, matches(filter, notification)),
      );
    });
}
