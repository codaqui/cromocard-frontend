import { useEffect, useRef } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { activeLabel, listedLabel } from '../../chat.format';
import { chatTexts } from '../../chat.labels';
import type { ConversationFilter, ConversationSummary } from '../../chat.types';
import { ConversationFilters } from '../ConversationFilters/ConversationFilters';
import { ConversationListItem } from '../ConversationListItem/ConversationListItem';
import styles from './ConversationList.module.css';

export interface ConversationListProps {
  conversations: ConversationSummary[];
  totals: Record<ConversationFilter, number>;
  filter: ConversationFilter;
  search: string;
  activeId: string | null;
  online: ReadonlySet<string>;
  onFilterChange: (filter: ConversationFilter) => void;
  onSearchChange: (search: string) => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

function useSlashShortcut() {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (event.key !== '/' || typing) return;
      event.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', focus);
    return () => window.removeEventListener('keydown', focus);
  }, []);
  return input;
}

function ListHeader({
  total,
  onNewConversation,
}: {
  total: number;
  onNewConversation: () => void;
}) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>Conversas</h2>
      <span className={styles.active}>{activeLabel(total)}</span>
      <button
        type="button"
        className={styles.newButton}
        aria-label={chatTexts.newConversation}
        onClick={onNewConversation}
      >
        <Icon name="edit" size={18} />
      </button>
    </div>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const input = useSlashShortcut();
  return (
    <label className={styles.search}>
      <Icon name="search" size={16} />
      <input
        ref={input}
        type="search"
        className={styles.searchInput}
        placeholder="Buscar conversa"
        aria-label="Buscar conversa"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <kbd className={styles.kbd}>/</kbd>
    </label>
  );
}

export function ConversationList(props: ConversationListProps) {
  const { conversations, totals, activeId, online } = props;
  return (
    <section className={styles.column} aria-label="Conversas">
      <ListHeader total={totals.all} onNewConversation={props.onNewConversation} />
      <SearchField value={props.search} onChange={props.onSearchChange} />
      <ConversationFilters active={props.filter} totals={totals} onChange={props.onFilterChange} />
      <ul className={styles.list}>
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeId}
            online={online.has(conversation.contact.id)}
            onSelect={props.onSelect}
          />
        ))}
      </ul>
      <p className={styles.footer}>{listedLabel(conversations.length, totals.all)}</p>
    </section>
  );
}
