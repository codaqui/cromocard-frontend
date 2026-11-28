import { useDeferredValue, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useAuth } from '@/hooks/useAuth';

import { conversationsOf, useConversations } from '../../chat.queries';
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

function useConversationList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const q = useDeferredValue(search.trim());
  const conversations = useConversations({ q: q || undefined, filter });
  const unfiltered = useConversations({ filter: 'all' });
  const items = conversationsOf(conversations.data?.pages);
  const recent = conversationsOf(unfiltered.data?.pages).map(({ contact }) => contact);
  const totals = conversations.data?.pages[0]?.meta.totals;
  const loadMore = () => {
    if (conversations.hasNextPage && !conversations.isFetchingNextPage)
      void conversations.fetchNextPage();
  };
  return { search, setSearch, filter, setFilter, conversations, items, recent, totals, loadMore };
}

export function useMessagesPage() {
  const { user } = useAuth();
  const list = useConversationList();
  const { items } = list;
  const online = usePresence(items.map(({ contact }) => contact.id));
  const { openId, open, opened, openStarted } = useOpenedConversation(items);
  useChatSocket(openId);
  return { ...list, user, online, openId, open, opened, openStarted };
}

export type MessagesPageState = ReturnType<typeof useMessagesPage>;
