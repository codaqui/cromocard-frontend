import { useDeferredValue, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useAuth } from '@/hooks/useAuth';

import { useConversations } from '../../chat.queries';
import type { ConversationFilter } from '../../chat.types';
import { useChatSocket } from '../../hooks/useChatSocket';
import { usePresence } from '../../hooks/usePresence';
import { useConversationDraft } from './useConversationDraft';

const CONVERSATION_PARAM = 'conversa';

function useOpenConversation() {
  const [params, setParams] = useSearchParams();
  const { draftFor, forget } = useConversationDraft();
  const openId = params.get(CONVERSATION_PARAM);
  const open = (id: string | null) => {
    forget();
    setParams((current) => {
      if (id) current.set(CONVERSATION_PARAM, id);
      else current.delete(CONVERSATION_PARAM);
      return current;
    });
  };
  return { openId, open, draft: draftFor(openId) };
}

export function useMessagesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const q = useDeferredValue(search.trim());
  const conversations = useConversations({ q: q || undefined, filter });
  const opening = useOpenConversation();
  const items = conversations.data?.data ?? [];
  const online = usePresence(items.map(({ contact }) => contact.id));
  useChatSocket(opening.openId);
  const opened = items.find(({ id }) => id === opening.openId) ?? null;
  return {
    user,
    search,
    setSearch,
    filter,
    setFilter,
    conversations,
    items,
    online,
    ...opening,
    opened,
  };
}

export type MessagesPageState = ReturnType<typeof useMessagesPage>;
