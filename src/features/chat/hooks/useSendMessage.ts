import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { connectSocket } from '@/lib/socket';

import { appendMessage, refreshConversations } from '../chat.queries';
import type { ChatMessage } from '../chat.types';

const SEND_TIMEOUT_MS = 8000;
const CONTACT_BLOCKED = 'CONTACT_BLOCKED';

type SendAck = { data: ChatMessage } | { error: string; message: string };

function refusalOf(ack: { error: string; message: string }, queryClient: QueryClient) {
  if (ack.error === CONTACT_BLOCKED) void refreshConversations(queryClient);
  return new Error(ack.message);
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useCallback(
    async (conversationId: string, content: string): Promise<ChatMessage> => {
      const ack = (await connectSocket()
        .timeout(SEND_TIMEOUT_MS)
        .emitWithAck('message:send', { conversationId, content })) as SendAck;
      if ('error' in ack) throw refusalOf(ack, queryClient);
      appendMessage(queryClient, ack.data);
      void refreshConversations(queryClient);
      return ack.data;
    },
    [queryClient],
  );
}
