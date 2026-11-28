import type { PaginationMeta } from '@/types/api';

export interface Contact {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  verified: boolean;
}

export interface ConversationSummary {
  id: string;
  contact: Contact;
  lastMessage: { content: string; fromMe: boolean; createdAt: string } | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  author: { id: string; name: string; username: string | null };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export type ConversationFilter = 'all' | 'unread';
export type ContactScope = 'all' | 'groups' | 'sellers' | 'deals';

export interface ListConversationsParams {
  q?: string;
  filter: ConversationFilter;
}

export interface ConversationsMeta extends PaginationMeta {
  totals: { all: number; unread: number };
}

export interface ConversationsPage {
  data: ConversationSummary[];
  meta: ConversationsMeta;
}

export interface MessagesPage {
  data: ChatMessage[];
  meta: { nextCursor: string | null };
}

export interface ContactResult extends Contact {
  role: string;
  commonGroups: string[];
}

export interface ContactsParams {
  q?: string;
  scope: ContactScope;
}
