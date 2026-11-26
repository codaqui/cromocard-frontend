import { api } from '@/lib/http';

import type {
  ChatMessage,
  ContactResult,
  ContactsParams,
  ConversationSummary,
  ConversationsMeta,
  ListConversationsParams,
} from './chat.types';

const BASE = '/me/conversations';

export const chatApi = {
  list: (params: ListConversationsParams) =>
    api.getWithMeta<ConversationSummary[], ConversationsMeta>(BASE, params),
  start: (userId: string) => api.post<ConversationSummary>(BASE, { userId }),
  messages: (conversationId: string, cursor?: string) =>
    api.getWithMeta<ChatMessage[], { nextCursor: string | null }>(
      `${BASE}/${conversationId}/messages`,
      { cursor },
    ),
  markAsRead: (conversationId: string) => api.postEmpty(`${BASE}/${conversationId}/read`),
  contacts: (params: ContactsParams) => api.get<ContactResult[]>('/me/contacts', params),
};
