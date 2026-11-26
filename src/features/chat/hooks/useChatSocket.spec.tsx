import { type InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/contexts/AuthContext';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import { chatApi } from '../chat.api';
import { chatKeys } from '../chat.queries';
import type { MessagesPage } from '../chat.types';
import { ANA_ID, message } from '@/test/chat/chat-fixtures';
import { createFakeSocket, type FakeSocket } from '@/test/chat/fake-socket';
import { useChatSocket } from './useChatSocket';

let socket: FakeSocket;
vi.mock('@/lib/socket', () => ({ connectSocket: () => socket }));
vi.mock('../chat.api', () => ({ chatApi: { markAsRead: vi.fn().mockResolvedValue(undefined) } }));

const user = { id: ANA_ID, role: 'CUSTOMER' } as AuthenticatedUser;

function setup(openConversationId: string | null) {
  const queryClient = new QueryClient();
  queryClient.setQueryData<InfiniteData<MessagesPage>>(chatKeys.messages('c-elisa'), {
    pages: [{ data: [message({ id: 'm1' })], meta: { nextCursor: null } }],
    pageParams: [undefined],
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext
        value={{
          user,
          isRestoringSession: false,
          hasSignedOut: false,
          signIn: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        {children}
      </AuthContext>
    </QueryClientProvider>
  );
  const hook = renderHook(() => useChatSocket(openConversationId), { wrapper });
  const messages = () =>
    queryClient
      .getQueryData<InfiniteData<MessagesPage>>(chatKeys.messages('c-elisa'))
      ?.pages[0]?.data.map(({ id }) => id);
  return { hook, invalidate, messages };
}

describe('useChatSocket (R8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socket = createFakeSocket();
  });

  it('CA6: entra na sala da conversa aberta, e a mensagem que chega entra no fim, já lida', async () => {
    const { messages } = setup('c-elisa');

    socket.receive('message:new', message({ id: 'm2', content: 'Chegou' }));

    expect(socket.emit).toHaveBeenCalledWith('conversation:join', { conversationId: 'c-elisa' });
    expect(messages()).toEqual(['m1', 'm2']);
    await vi.waitFor(() =>
      expect(vi.mocked(chatApi.markAsRead).mock.calls[0]?.[0]).toBe('c-elisa'),
    );
  });

  it('não repete a mensagem que já está na conversa', () => {
    const { messages } = setup('c-elisa');

    socket.receive('message:new', message({ id: 'm1' }));

    expect(messages()).toEqual(['m1']);
  });

  it('CA6: mensagem de outra conversa só atualiza a lista, sem marcar como lida', () => {
    const { invalidate } = setup('c-elisa');

    socket.receive('message:new', message({ id: 'm3', conversationId: 'c-bruno' }));

    expect(chatApi.markAsRead).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: chatKeys.conversations() });
  });

  it('a própria mensagem, vinda de outra aba, não é marcada como lida', () => {
    setup('c-elisa');

    socket.receive(
      'message:new',
      message({ id: 'm4', author: { id: ANA_ID, name: 'Ana', username: 'ana' } }),
    );

    expect(chatApi.markAsRead).not.toHaveBeenCalled();
  });

  it('volta para a sala ao reconectar e sai dela ao fechar a conversa', () => {
    const { hook } = setup('c-elisa');

    socket.receive('connect');
    hook.unmount();

    expect(socket.emit).toHaveBeenCalledTimes(3);
    expect(socket.emit).toHaveBeenLastCalledWith('conversation:leave', {
      conversationId: 'c-elisa',
    });
    expect(socket.listenerCount('message:new')).toBe(0);
    expect(socket.listenerCount('connect')).toBe(0);
  });

  it('sem conversa aberta, não entra em sala nenhuma', () => {
    setup(null);

    expect(socket.emit).not.toHaveBeenCalled();
    expect(socket.listenerCount('message:new')).toBe(1);
  });
});
