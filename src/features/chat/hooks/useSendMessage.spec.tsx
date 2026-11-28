import { type InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatKeys } from '../chat.queries';
import type { MessagesPage } from '../chat.types';
import { message } from '@/test/chat/chat-fixtures';
import { createFakeSocket, type FakeSocket } from '@/test/chat/fake-socket';
import { useSendMessage } from './useSendMessage';

let socket: FakeSocket;
vi.mock('@/lib/socket', () => ({ connectSocket: () => socket }));

function setup() {
  const queryClient = new QueryClient();
  queryClient.setQueryData<InfiniteData<MessagesPage>>(chatKeys.messages('c-elisa'), {
    pages: [{ data: [], meta: { nextCursor: null } }],
    pageParams: [undefined],
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useSendMessage(), { wrapper });
  return { send: result.current, queryClient };
}

describe('useSendMessage (R18)', () => {
  beforeEach(() => {
    socket = createFakeSocket();
  });

  it('CA16: envia pelo socket e põe a mensagem gravada no fim da conversa', async () => {
    const sent = message({ id: 'm9', content: 'Combinado' });
    socket.emitWithAck.mockResolvedValue({ data: sent });
    const { send, queryClient } = setup();

    await expect(send('c-elisa', 'Combinado')).resolves.toEqual(sent);

    expect(socket.emitWithAck).toHaveBeenCalledWith('message:send', {
      conversationId: 'c-elisa',
      content: 'Combinado',
    });
    const data = queryClient.getQueryData<InfiniteData<MessagesPage>>(chatKeys.messages('c-elisa'));
    expect(data?.pages[0]?.data).toEqual([sent]);
  });

  it('CA16: recusa com a mensagem do servidor quando a gravação falha', async () => {
    socket.emitWithAck.mockResolvedValue({
      error: 'CONVERSATION_NOT_FOUND',
      message: 'Conversa não encontrada',
    });
    const { send } = setup();

    await expect(send('c-elisa', 'Oi')).rejects.toThrow('Conversa não encontrada');
  });
});
