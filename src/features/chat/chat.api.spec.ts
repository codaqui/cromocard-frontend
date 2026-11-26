import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatApi } from './chat.api';

const api = vi.hoisted(() => ({
  get: vi.fn(),
  getWithMeta: vi.fn(),
  post: vi.fn(),
  postEmpty: vi.fn(),
}));

vi.mock('@/lib/http', () => ({ api }));

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista as conversas com a busca e a aba', async () => {
    await chatApi.list({ q: 'ren', filter: 'unread' });

    expect(api.getWithMeta).toHaveBeenCalledWith('/me/conversations', {
      q: 'ren',
      filter: 'unread',
    });
  });

  it('abre a conversa com alguém e marca as recebidas como lidas', async () => {
    await chatApi.start('u1');
    await chatApi.markAsRead('c1');

    expect(api.post).toHaveBeenCalledWith('/me/conversations', { userId: 'u1' });
    expect(api.postEmpty).toHaveBeenCalledWith('/me/conversations/c1/read');
  });

  it('busca as mensagens pelo cursor e os contatos pela aba', async () => {
    await chatApi.messages('c1', 'm9');
    await chatApi.contacts({ q: 'ana', scope: 'groups' });

    expect(api.getWithMeta).toHaveBeenCalledWith('/me/conversations/c1/messages', { cursor: 'm9' });
    expect(api.get).toHaveBeenCalledWith('/me/contacts', { q: 'ana', scope: 'groups' });
  });
});
