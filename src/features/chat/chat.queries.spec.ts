import { describe, expect, it } from 'vitest';

import { conversationsOf, messagesInOrder } from './chat.queries';
import type { ConversationsPage } from './chat.types';
import { bruno, conversation, message } from '@/test/chat/chat-fixtures';

describe('messagesInOrder (R4)', () => {
  it('junta as páginas da mais antiga para a mais recente', () => {
    const recent = {
      data: [message({ id: 'm3' }), message({ id: 'm4' })],
      meta: { nextCursor: 'm3' },
    };
    const older = {
      data: [message({ id: 'm1' }), message({ id: 'm2' })],
      meta: { nextCursor: null },
    };

    expect(messagesInOrder([recent, older]).map(({ id }) => id)).toEqual(['m1', 'm2', 'm3', 'm4']);
    expect(messagesInOrder()).toEqual([]);
  });
});

describe('conversationsOf (R3)', () => {
  it('junta as páginas da lista na ordem em que chegaram', () => {
    const meta = { page: 1, pageSize: 50, total: 2, totalPages: 2, totals: { all: 2, unread: 1 } };
    const pages: ConversationsPage[] = [
      { data: [conversation()], meta },
      { data: [bruno], meta: { ...meta, page: 2 } },
    ];

    expect(conversationsOf(pages).map(({ id }) => id)).toEqual(['c-elisa', 'c-bruno']);
    expect(conversationsOf()).toEqual([]);
  });
});
