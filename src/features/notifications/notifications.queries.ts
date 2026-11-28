import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { notificationsApi } from './notifications.api';
import { notificationsKeys } from './notifications.cache';
import type { NotificationFilter, NotificationPreferences } from './notifications.types';

export const NOTIFICATIONS_PAGE_SIZE = 50;

const refreshLists = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: notificationsKeys.lists() });

export function useNotifications(filter: NotificationFilter, limit = NOTIFICATIONS_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: notificationsKeys.list(filter, limit),
    queryFn: ({ pageParam }) => notificationsApi.list({ filter, limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: ({ meta }) => meta.nextCursor ?? undefined,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => refreshLists(queryClient),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationsKeys.preferences(),
    queryFn: notificationsApi.getPreferences,
  });
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      notificationsApi.savePreferences(preferences),
    onSuccess: (saved) => {
      queryClient.setQueryData(notificationsKeys.preferences(), saved);
    },
  });
}

export function useRestoreNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.restorePreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKeys.preferences() }),
  });
}
