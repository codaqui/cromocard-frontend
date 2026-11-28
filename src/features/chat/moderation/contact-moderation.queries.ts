import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatKeys, refreshConversations } from '../chat.queries';
import { contactModerationApi } from './contact-moderation.api';

export const blockedContactsKey = (page: number) => [...chatKeys.all, 'blocks', page] as const;

function useRefreshingMutation<T, R>(request: (input: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: T) => request(input),
    onSuccess: async () => {
      await Promise.all([
        refreshConversations(queryClient),
        queryClient.invalidateQueries({ queryKey: [...chatKeys.all, 'blocks'] }),
      ]);
    },
  });
}

export const useBlockContact = () => useRefreshingMutation(contactModerationApi.block);

export const useUnblockContact = () => useRefreshingMutation(contactModerationApi.unblock);

export const useReportContact = () => useRefreshingMutation(contactModerationApi.report);

export function useBlockedContacts(page: number) {
  return useQuery({
    queryKey: blockedContactsKey(page),
    queryFn: () => contactModerationApi.listBlocks(page),
  });
}
