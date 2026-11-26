import type { ChatMessage, ConversationSummary } from '@/features/chat';

export const ANA_ID = 'ana';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export function conversation(changes: Partial<ConversationSummary> = {}): ConversationSummary {
  return {
    id: 'c-elisa',
    contact: {
      id: 'elisa',
      name: 'Elisa Cartas Raras',
      username: 'elisa.raras',
      avatarUrl: null,
      verified: true,
    },
    block: null,
    lastMessage: {
      content: 'Combinado, compro pelo anúncio.',
      fromMe: true,
      createdAt: minutesAgo(5),
    },
    unreadCount: 0,
    createdAt: minutesAgo(100),
    ...changes,
  };
}

export const bruno = conversation({
  id: 'c-bruno',
  contact: {
    id: 'bruno',
    name: 'Bruno Figurinhas',
    username: null,
    avatarUrl: null,
    verified: false,
  },
  lastMessage: { content: 'Te mandei o link do anúncio', fromMe: false, createdAt: minutesAgo(60) },
  unreadCount: 1,
});

export function message(changes: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm1',
    conversationId: 'c-elisa',
    author: { id: 'elisa', name: 'Elisa Cartas Raras', username: 'elisa.raras' },
    content: 'Olá Ana!',
    isRead: true,
    createdAt: minutesAgo(30),
    ...changes,
  };
}
