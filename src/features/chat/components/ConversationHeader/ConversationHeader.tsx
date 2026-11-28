import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { publicProfilePathFor } from '@/routes/paths';

import { chatTexts } from '../../chat.labels';
import type { Contact } from '../../chat.types';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import styles from './ConversationHeader.module.css';

interface ConversationHeaderProps {
  contact: Contact;
  online: boolean;
  onBack?: () => void;
  onModerate: () => void;
}

function Identity({ contact }: { contact: Contact }) {
  return (
    <div className={styles.identity}>
      <h2 className={styles.name}>{contact.name}</h2>
      {contact.username && <span className={styles.handle}>(@{contact.username})</span>}
      {contact.verified && (
        <span className={styles.verified}>
          <Icon name="verifiedUser" size={12} />
          {chatTexts.verified}
        </span>
      )}
    </div>
  );
}

function Actions({ contactId, onModerate }: { contactId: string; onModerate: () => void }) {
  return (
    <>
      <Link to={publicProfilePathFor(contactId)} className={styles.profile}>
        <Icon name="person" size={16} />
        Ver Perfil
      </Link>
      <button
        type="button"
        className={styles.shield}
        aria-label="Bloquear ou denunciar"
        onClick={onModerate}
      >
        <Icon name="shield" size={18} />
      </button>
    </>
  );
}

export function ConversationHeader({
  contact,
  online,
  onBack,
  onModerate,
}: ConversationHeaderProps) {
  return (
    <header className={styles.header}>
      {onBack && (
        <button
          type="button"
          className={styles.back}
          aria-label="Voltar para as conversas"
          onClick={onBack}
        >
          <Icon name="chevronLeft" size={20} />
        </button>
      )}
      <ContactAvatar name={contact.name} avatarUrl={contact.avatarUrl} online={online} />
      <Identity contact={contact} />
      <Actions contactId={contact.id} onModerate={onModerate} />
    </header>
  );
}
