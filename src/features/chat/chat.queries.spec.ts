import { describe, expect, it } from 'vitest';

import { messagesInOrder } from './chat.queries';
import { message } from '@/test/chat/chat-fixtures';

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
