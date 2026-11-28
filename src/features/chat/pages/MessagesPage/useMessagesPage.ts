import { useDeferredValue, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useAuth } from '@/hooks/useAuth';

import { useConversations } from '../../chat.queries';
import type { ConversationFilter, ConversationSummary } from '../../chat.types';
import { useChatSocket } from '../../hooks/useChatSocket';
import { usePresence } from '../../hooks/usePresence';

const CONVERSATION_PARAM = 'conversa';

function useOpenConversation() {
  const [params, setParams] = useSearchParams();
  const openId = params.get(CONVERSATION_PARAM);
  const open = (id: string | null) =>
    setParams((current) => {
      if (id) current.set(CONVERSATION_PARAM, id);
      else current.delete(CONVERSATION_PARAM);
      return current;
    });
  return { openId, open };
}

function useOpenedConversation(items: ConversationSummary[]) {
  const { openId, open } = useOpenConversation();
  const [kept, keep] = useState<ConversationSummary | null>(null);
  const listed = items.find(({ id }) => id === openId);
  if (listed && listed !== kept) keep(listed);
  const opened = listed ?? (kept?.id === openId ? kept : null);
  const openStarted = (conversation: ConversationSummary) => {
    keep(conversation);
    open(conversation.id);
  };
  return { openId, open, opened, openStarted };
}

export function useMessagesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const q = useDeferredValue(search.trim());
  const conversations = useConversations({ q: q || undefined, filter });
  const items = conversations.data?.data ?? [];
  const online = usePresence(items.map(({ contact }) => contact.id));
  const { openId, open, opened, openStarted } = useOpenedConversation(items);
  useChatSocket(openId);
  return {
    user,
    search,
    setSearch,
    filter,
    setFilter,
    conversations,
    items,
    online,
    openId,
    open,
    opened,
    openStarted,
  };
}

export type MessagesPageState = ReturnType<typeof useMessagesPage>;
