import { useDeferredValue, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';

import { chatTexts, scopeLabels } from '../../chat.labels';
import { useContacts, useStartConversation } from '../../chat.queries';
import type { Contact, ContactResult, ContactScope, ConversationSummary } from '../../chat.types';
import { ContactRow } from '../ContactRow/ContactRow';
import { FilterPills } from '../FilterPills/FilterPills';
import { SearchField } from '../SearchField/SearchField';
import styles from './NewConversationModal.module.css';

export interface NewConversationModalProps {
  recent: Contact[];
  onStarted: (conversation: ConversationSummary) => void;
  onClose: () => void;
}

const scopes = (Object.keys(scopeLabels) as ContactScope[]).map((id) => ({
  id,
  label: scopeLabels[id],
}));
const RECENT_LIMIT = 3;

interface ContactSectionProps {
  title: string;
  contacts: (Contact | ContactResult)[];
  busy: boolean;
  onStart: (userId: string) => void;
}

function ContactSection({ title, contacts, busy, onStart }: ContactSectionProps) {
  return (
    <section className={styles.section} aria-label={title}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <ul className={styles.rows}>
        {contacts.map((contact) => (
          <ContactRow key={contact.id} contact={contact} disabled={busy} onStart={onStart} />
        ))}
      </ul>
    </section>
  );
}

function useNewConversation(onStarted: NewConversationModalProps['onStarted']) {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<ContactScope>('all');
  const q = useDeferredValue(search.trim());
  const contacts = useContacts({ q: q || undefined, scope }, true);
  const start = useStartConversation();
  const startWith = (userId: string) =>
    start.mutate(userId, { onSuccess: (conversation) => onStarted(conversation) });
  return { search, setSearch, scope, setScope, contacts, start, startWith };
}

type Flow = ReturnType<typeof useNewConversation>;

function Results({ flow, recent }: { flow: Flow; recent: Contact[] }) {
  const results = flow.contacts.data ?? [];
  const found = new Set(results.map(({ id }) => id));
  const recentOthers = recent.filter(({ id }) => !found.has(id)).slice(0, RECENT_LIMIT);
  const section = { busy: flow.start.isPending, onStart: flow.startWith };
  return (
    <>
      <ContactSection title="Resultados" contacts={results} {...section} />
      {flow.contacts.isSuccess && results.length === 0 && (
        <p className={styles.empty}>{chatTexts.noResults}</p>
      )}
      {recentOthers.length > 0 && (
        <ContactSection title="Conversas recentes" contacts={recentOthers} {...section} />
      )}
    </>
  );
}

function ContactFilters({ flow }: { flow: Flow }) {
  return (
    <>
      <SearchField
        label="Buscar colecionador"
        placeholder="Buscar por nome ou @"
        value={flow.search}
        onChange={flow.setSearch}
        outlined
      />
      <div className={styles.scopes}>
        <FilterPills
          label="Filtrar colecionadores"
          items={scopes}
          active={flow.scope}
          onChange={flow.setScope}
          compact
        />
      </div>
    </>
  );
}

export function NewConversationModal({ recent, onStarted, onClose }: NewConversationModalProps) {
  const flow = useNewConversation(onStarted);
  return (
    <Modal
      open
      variant="framed"
      size="medium"
      icon="edit"
      title={chatTexts.newConversation}
      subtitle={chatTexts.newConversationSubtitle}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      <ContactFilters flow={flow} />
      {flow.start.isError && <FormError message={chatTexts.startError} />}
      <Results flow={flow} recent={recent} />
    </Modal>
  );
}
