import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { globalNotificationsApi } from './global-notifications.api';
import type { DispatchNotificationInput, ListDispatchesParams } from './global-notifications.types';

export const globalNotificationsKeys = {
  all: ['admin', 'global-notifications'] as const,
  list: (params: ListDispatchesParams) => [...globalNotificationsKeys.all, 'list', params] as const,
  recipientsCount: () => [...globalNotificationsKeys.all, 'recipients-count'] as const,
};

export function useDispatchHistory(params: ListDispatchesParams) {
  return useQuery({
    queryKey: globalNotificationsKeys.list(params),
    queryFn: () => globalNotificationsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useRecipientsCount() {
  return useQuery({
    queryKey: globalNotificationsKeys.recipientsCount(),
    queryFn: globalNotificationsApi.recipientsCount,
  });
}

function useInvalidateHistory() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: globalNotificationsKeys.all });
}

export function useDispatchNotification() {
  const invalidate = useInvalidateHistory();
  return useMutation({
    mutationFn: (input: DispatchNotificationInput) => globalNotificationsApi.dispatch(input),
    onSuccess: invalidate,
  });
}

export function useCancelSchedule() {
  const invalidate = useInvalidateHistory();
  return useMutation({
    mutationFn: (id: string) => globalNotificationsApi.cancel(id),
    onSuccess: invalidate,
  });
}
