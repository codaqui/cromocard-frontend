import {
  type InfiniteData,
  keepPreviousData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { chatApi } from './chat.api';
import type {
  ChatMessage,
  ContactsParams,
  ConversationsPage,
  ListConversationsParams,
  MessagesPage,
} from './chat.types';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversationList: (params: ListConversationsParams) =>
    [...chatKeys.conversations(), params] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
  contacts: (params: ContactsParams) => [...chatKeys.all, 'contacts', params] as const,
};

export function useConversations(params: ListConversationsParams) {
  return useInfiniteQuery({
    queryKey: chatKeys.conversationList(params),
    queryFn: ({ pageParam }) => chatApi.list(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ meta }: ConversationsPage) =>
      meta.page < meta.totalPages ? meta.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) => chatApi.messages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: MessagesPage) => last.meta.nextCursor ?? undefined,
  });
}

export function useContacts(params: ContactsParams, enabled: boolean) {
  return useQuery({
    queryKey: chatKeys.contacts(params),
    queryFn: () => chatApi.contacts(params),
    enabled,
  });
}

export const refreshConversations = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.markAsRead,
    onSuccess: () => refreshConversations(queryClient),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.start,
    onSuccess: () => refreshConversations(queryClient),
  });
}

const withMessage = (pages: MessagesPage[], message: ChatMessage): MessagesPage[] => {
  const [latest, ...older] = pages;
  if (!latest || pages.some((page) => page.data.some(({ id }) => id === message.id))) return pages;
  return [{ ...latest, data: [...latest.data, message] }, ...older];
};

export function appendMessage(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<InfiniteData<MessagesPage>>(
    chatKeys.messages(message.conversationId),
    (data) => (data ? { ...data, pages: withMessage(data.pages, message) } : data),
  );
}

export const conversationsOf = (pages: ConversationsPage[] = []) =>
  pages.flatMap(({ data }) => data);

export const messagesInOrder = (pages: MessagesPage[] = []) =>
  pages.toReversed().flatMap(({ data }) => data);
