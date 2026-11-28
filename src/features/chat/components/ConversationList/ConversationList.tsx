import { useEffect, useRef } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { activeLabel, listedLabel } from '../../chat.format';
import { chatTexts, filterLabels } from '../../chat.labels';
import type { ConversationFilter, ConversationSummary } from '../../chat.types';
import { ConversationListItem } from '../ConversationListItem/ConversationListItem';
import { FilterPills } from '../FilterPills/FilterPills';
import { SearchField } from '../SearchField/SearchField';
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
      {total > 0 && <span className={styles.active}>{activeLabel(total)}</span>}
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

const filters: ConversationFilter[] = ['all', 'unread'];

function ConversationSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const input = useSlashShortcut();
  return (
    <SearchField
      label="Buscar conversa"
      placeholder="Buscar conversa"
      value={value}
      onChange={onChange}
      inputRef={input}
      hint={<kbd className={styles.kbd}>/</kbd>}
    />
  );
}

function filterPillsOf(totals: Record<ConversationFilter, number>) {
  return filters.map((id) => ({
    id,
    label: filterLabels[id],
    count: totals.all > 0 ? totals[id] : undefined,
  }));
}

function ConversationItems(props: ConversationListProps) {
  const { conversations, activeId, online } = props;
  return (
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
  );
}

export function ConversationList(props: ConversationListProps) {
  const { conversations, totals } = props;
  return (
    <section className={styles.column} aria-label="Conversas">
      <ListHeader total={totals.all} onNewConversation={props.onNewConversation} />
      <ConversationSearch value={props.search} onChange={props.onSearchChange} />
      <FilterPills
        label="Filtrar conversas"
        items={filterPillsOf(totals)}
        active={props.filter}
        onChange={props.onFilterChange}
      />
      <ConversationItems {...props} />
      <p className={styles.footer}>{listedLabel(conversations.length, totals.all)}</p>
    </section>
  );
}
