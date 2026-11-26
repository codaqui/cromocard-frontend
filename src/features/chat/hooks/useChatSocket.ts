import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { connectSocket } from '@/lib/socket';

import { appendMessage, refreshConversations, useMarkAsRead } from '../chat.queries';
import type { ChatMessage } from '../chat.types';

function useJoinConversation(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return undefined;
    const socket = connectSocket();
    const join = () => socket.emit('conversation:join', { conversationId });
    join();
    socket.on('connect', join);
    return () => {
      socket.off('connect', join);
      socket.emit('conversation:leave', { conversationId });
    };
  }, [conversationId]);
}

export function useChatSocket(openConversationId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { mutate: markAsRead } = useMarkAsRead();
  useJoinConversation(openConversationId);

  useEffect(() => {
    const socket = connectSocket();
    const receive = (message: ChatMessage) => {
      appendMessage(queryClient, message);
      const readNow =
        message.conversationId === openConversationId && message.author.id !== user?.id;
      if (readNow) markAsRead(message.conversationId);
      else void refreshConversations(queryClient);
    };
    socket.on('message:new', receive);
    return () => {
      socket.off('message:new', receive);
    };
  }, [queryClient, openConversationId, user?.id, markAsRead]);
}
