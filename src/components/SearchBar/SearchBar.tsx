import { type FormEvent, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import styles from './SearchBar.module.css';

export interface SearchScope {
  value: string;
  label: string;
}

export interface SearchQuery {
  term: string;
  scope: string;
}

interface SearchBarProps {
  scopes: readonly SearchScope[];
  label: string;
  onSearch: (query: SearchQuery) => void;
}

interface ScopeTabsProps {
  scopes: readonly SearchScope[];
  selected: string;
  onSelect: (scope: string) => void;
}

function ScopeTabs({ scopes, selected, onSelect }: ScopeTabsProps) {
  return (
    <div className={styles.scopes} role="group" aria-label="Buscar em">
      {scopes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={value === selected}
          className={cn(styles.scope, value === selected && styles.selected)}
          onClick={() => onSelect(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SearchBar({ scopes, label, onSearch }: SearchBarProps) {
  const [term, setTerm] = useState('');
  const [scope, setScope] = useState(scopes[0]?.value ?? '');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch({ term: term.trim(), scope });
  };

  return (
    <form role="search" className={styles.form} onSubmit={submit}>
      <Icon name="search" size={20} />
      <input
        type="search"
        className={styles.input}
        aria-label={label}
        placeholder={`${label}…`}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
      />
      <ScopeTabs scopes={scopes} selected={scope} onSelect={setScope} />
    </form>
  );
}
