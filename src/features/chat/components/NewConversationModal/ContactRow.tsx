import { Button } from '@/components/Button/Button';

import { commonGroupsLabel, initialsOf } from '../../chat.format';
import type { Contact, ContactResult } from '../../chat.types';
import styles from './NewConversationModal.module.css';

interface ContactRowProps {
  contact: Contact | ContactResult;
  disabled: boolean;
  onStart: (userId: string) => void;
}

const isSeller = (contact: Contact | ContactResult) =>
  'role' in contact && contact.role === 'SELLER';
const groupsOf = (contact: Contact | ContactResult) =>
  'commonGroups' in contact ? contact.commonGroups : [];

function detailsOf(contact: Contact | ContactResult) {
  const groups = commonGroupsLabel(groupsOf(contact));
  if (isSeller(contact)) return { subtitle: 'Vendedor', tag: 'Lojista' };
  return { subtitle: groups, tag: groupsOf(contact).length > 1 ? groups : groupsOf(contact)[0] };
}

export function ContactRow({ contact, disabled, onStart }: ContactRowProps) {
  const { subtitle, tag } = detailsOf(contact);
  const handle = contact.username ? ` (@${contact.username})` : '';
  return (
    <li className={styles.row}>
      <span className={styles.initials} aria-hidden="true">
        {initialsOf(contact.name)}
      </span>
      <span className={styles.who}>
        <span className={styles.name}>{`${contact.name}${handle}`}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {tag && <span className={styles.tag}>{tag}</span>}
      <Button
        variant="secondary"
        className={styles.talk}
        disabled={disabled}
        onClick={() => onStart(contact.id)}
      >
        Conversar
      </Button>
    </li>
  );
}
