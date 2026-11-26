import type { ConversationSummary } from '../../chat.types';
import { handleOf } from '../../chat.format';
import { moderationTexts } from '../../moderation/contact-moderation.labels';
import styles from './ContactModerationDialog.module.css';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(iso));

export function ContactCard({ conversation }: { conversation: ConversationSummary }) {
  const { contact, createdAt } = conversation;
  const handle = handleOf(contact.username);
  const details = [handle, moderationTexts.since(monthYear(createdAt))].filter(Boolean);
  return (
    <div className={styles.contact}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(contact.name)}
      </span>
      <span className={styles.optionText}>
        <span className={styles.optionLabel}>
          {contact.name}
          {handle && ` (${handle})`}
        </span>
        <span className={styles.optionHint}>{details.join(' • ')}</span>
      </span>
    </div>
  );
}
