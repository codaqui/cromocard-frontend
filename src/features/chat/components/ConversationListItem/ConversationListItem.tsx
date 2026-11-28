import { Icon } from '@/components/Icon/Icon';
import { VisuallyHidden } from '@/components/VisuallyHidden/VisuallyHidden';
import { cn } from '@/utils/cn';

import { handleOf, isToday, previewTime } from '../../chat.format';
import { chatTexts } from '../../chat.labels';
import type { ConversationSummary } from '../../chat.types';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import styles from './ConversationListItem.module.css';

interface ConversationListItemProps {
  conversation: ConversationSummary;
  active: boolean;
  online: boolean;
  onSelect: (id: string) => void;
}

function Preview({ conversation }: { conversation: ConversationSummary }) {
  const { lastMessage } = conversation;
  if (!lastMessage) return null;
  return (
    <p className={styles.preview}>
      {lastMessage.fromMe && 'Você: '}
      {lastMessage.content}
    </p>
  );
}

function VerifiedSeal() {
  return (
    <span className={styles.verified} title={chatTexts.verified}>
      <Icon name="verifiedUser" size={14} />
      <VisuallyHidden>{chatTexts.verified}</VisuallyHidden>
    </span>
  );
}

function ItemTop({ conversation }: { conversation: ConversationSummary }) {
  const { contact, lastMessage } = conversation;
  return (
    <span className={styles.top}>
      <span className={styles.name}>{contact.name}</span>
      {contact.verified && <VerifiedSeal />}
      {lastMessage && (
        <time
          className={cn(styles.time, isToday(lastMessage.createdAt) && styles.timeHighlight)}
          dateTime={lastMessage.createdAt}
        >
          {previewTime(lastMessage.createdAt)}
        </time>
      )}
    </span>
  );
}

function ItemBottom({ conversation }: { conversation: ConversationSummary }) {
  const { unreadCount } = conversation;
  return (
    <span className={styles.bottom}>
      <Preview conversation={conversation} />
      {unreadCount > 0 && (
        <span className={styles.badge} aria-label={`${unreadCount} não lidas`}>
          {unreadCount}
        </span>
      )}
    </span>
  );
}

export function ConversationListItem({
  conversation,
  active,
  online,
  onSelect,
}: ConversationListItemProps) {
  const { contact, unreadCount } = conversation;
  return (
    <li>
      <button
        type="button"
        className={cn(styles.item, active && styles.active, unreadCount > 0 && styles.unread)}
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(conversation.id)}
      >
        <ContactAvatar name={contact.name} avatarUrl={contact.avatarUrl} online={online} />
        <span className={styles.body}>
          <ItemTop conversation={conversation} />
          <span className={styles.handle}>{handleOf(contact.username)}</span>
          <ItemBottom conversation={conversation} />
        </span>
      </button>
    </li>
  );
}
