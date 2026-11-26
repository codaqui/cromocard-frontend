import { type UIEvent, useEffect, useMemo, useRef, useState } from 'react';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Toast } from '@/components/Toast/Toast';

import { dayLabel, handleOf, sameDay } from '../../chat.format';
import { chatTexts } from '../../chat.labels';
import { messagesInOrder, useMarkAsRead, useMessages } from '../../chat.queries';
import type { ChatMessage, ConversationSummary } from '../../chat.types';
import { useSendMessage } from '../../hooks/useSendMessage';
import { BlockedNotice } from '../BlockedNotice/BlockedNotice';
import { ContactModerationDialog } from '../ContactModerationDialog/ContactModerationDialog';
import type { ModerationNotice } from '../ContactModerationDialog/useContactModeration';
import { ConversationHeader } from '../ConversationHeader/ConversationHeader';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { MessageComposer } from '../MessageComposer/MessageComposer';
import { SafetyTip } from '../SafetyTip/SafetyTip';
import styles from './ConversationView.module.css';

export interface ConversationViewProps {
  conversation: ConversationSummary;
  currentUserId: string;
  online: boolean;
  onBack?: () => void;
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  unreadIds: ReadonlySet<string>;
}

function MessageList({ messages, currentUserId, unreadIds }: MessageListProps) {
  return (
    <ol className={styles.messages}>
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          previous={messages[index - 1]}
          mine={message.author.id === currentUserId}
          unread={unreadIds.has(message.id)}
        />
      ))}
    </ol>
  );
}

interface MessageItemProps {
  message: ChatMessage;
  previous: ChatMessage | undefined;
  mine: boolean;
  unread: boolean;
}

function MessageItem({ message, previous, ...bubble }: MessageItemProps) {
  const newDay = !previous || !sameDay(previous.createdAt, message.createdAt);
  return (
    <>
      {newDay && (
        <li className={styles.day}>
          <span>{dayLabel(message.createdAt)}</span>
        </li>
      )}
      <MessageBubble message={message} {...bubble} />
    </>
  );
}

const NONE: ReadonlySet<string> = new Set();

const unreadFrom = (messages: ChatMessage[], currentUserId: string) =>
  new Set(
    messages
      .filter(({ isRead, author }) => !isRead && author.id !== currentUserId)
      .map(({ id }) => id),
  );

function useUnreadOnOpen(
  conversationId: string,
  messages: ChatMessage[] | undefined,
  currentUserId: string,
) {
  const { mutate: markAsRead } = useMarkAsRead();
  const [opened, setOpened] = useState<{ id: string; unread: ReadonlySet<string> } | null>(null);
  if (messages && opened?.id !== conversationId)
    setOpened({ id: conversationId, unread: unreadFrom(messages, currentUserId) });
  const unread = opened?.id === conversationId ? opened.unread : NONE;
  const hasUnread = unread.size > 0;
  useEffect(() => {
    if (hasUnread) markAsRead(conversationId);
  }, [conversationId, hasUnread, markAsRead]);
  return unread;
}

function useScrollToLatest(lastId: string | undefined) {
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    area.current?.scrollTo?.({ top: area.current.scrollHeight });
  }, [lastId]);
  return area;
}

function Body({ conversation, currentUserId }: ConversationViewProps) {
  const query = useMessages(conversation.id);
  const messages = useMemo(
    () => (query.data ? messagesInOrder(query.data.pages) : undefined),
    [query.data],
  );
  const unreadIds = useUnreadOnOpen(conversation.id, messages, currentUserId);
  const area = useScrollToLatest(messages?.at(-1)?.id);
  const loadOlder = (event: UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop === 0 && query.hasNextPage && !query.isFetchingNextPage)
      void query.fetchNextPage();
  };

  if (query.isError) return <ErrorState message={chatTexts.loadError} />;
  if (!messages) return <LoadingState />;
  return (
    <div ref={area} className={styles.scroll} onScroll={loadOlder}>
      <SafetyTip />
      {query.isFetchingNextPage && <LoadingState />}
      <MessageList messages={messages} currentUserId={currentUserId} unreadIds={unreadIds} />
    </div>
  );
}

function Footer({ conversation }: { conversation: ConversationSummary }) {
  const sendMessage = useSendMessage();
  const { contact, block } = conversation;
  const handle = handleOf(contact.username) || contact.name;
  if (block) return <BlockedNotice block={block} contactId={contact.id} handle={handle} />;
  return (
    <MessageComposer
      recipient={handle}
      onSend={(content) => sendMessage(conversation.id, content)}
    />
  );
}

function useModerationDialog() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<ModerationNotice | null>(null);
  const done = (next: ModerationNotice) => {
    setOpen(false);
    setNotice(next);
  };
  return {
    open,
    notice,
    show: () => setOpen(true),
    close: () => setOpen(false),
    done,
    dismiss: () => setNotice(null),
  };
}

type ModerationState = ReturnType<typeof useModerationDialog>;

interface ModerationLayerProps {
  conversation: ConversationSummary;
  moderation: ModerationState;
}

function ModerationLayer({ conversation, moderation }: ModerationLayerProps) {
  return (
    <>
      {moderation.open && (
        <ContactModerationDialog
          conversation={conversation}
          onClose={moderation.close}
          onDone={moderation.done}
        />
      )}
      <Toast
        message={moderation.notice?.title ?? null}
        detail={moderation.notice?.detail}
        placement="top"
        tinted
        onDismiss={moderation.dismiss}
      />
    </>
  );
}

export function ConversationView(props: ConversationViewProps) {
  const { conversation, online, onBack } = props;
  const moderation = useModerationDialog();
  return (
    <section className={styles.view} aria-label={`Conversa com ${conversation.contact.name}`}>
      <ConversationHeader
        contact={conversation.contact}
        online={online}
        onBack={onBack}
        onModerate={moderation.show}
      />
      <Body {...props} />
      <Footer conversation={conversation} />
      <ModerationLayer conversation={conversation} moderation={moderation} />
    </section>
  );
}
