import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { connectSocket } from '@/lib/socket';

import { appendMessage, refreshConversations } from '../chat.queries';
import type { ChatMessage } from '../chat.types';

const SEND_TIMEOUT_MS = 8000;

type SendAck = { data: ChatMessage } | { error: string; message: string };

export class SendMessageError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useCallback(
    async (conversationId: string, content: string, replyToId?: string): Promise<ChatMessage> => {
      const payload = { conversationId, content, ...(replyToId && { replyToId }) };
      const ack = (await connectSocket()
        .timeout(SEND_TIMEOUT_MS)
        .emitWithAck('message:send', payload)) as SendAck;
      if ('error' in ack) throw new SendMessageError(ack.message, ack.error);
      appendMessage(queryClient, ack.data);
      void refreshConversations(queryClient);
      return ack.data;
    },
    [queryClient],
  );
}
