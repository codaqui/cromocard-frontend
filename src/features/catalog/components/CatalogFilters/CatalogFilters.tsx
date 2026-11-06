import type { ReactNode } from 'react';

import { TextField } from '@/components/TextField/TextField';

import styles from './CatalogFilters.module.css';

export interface CatalogFiltersTexts {
  label: string;
  searchLabel: string;
}

interface CatalogFiltersProps {
  texts: CatalogFiltersTexts;
  search: string;
  onSearchChange: (value: string) => void;
  children?: ReactNode;
}

export function CatalogFilters({ texts, search, onSearchChange, children }: CatalogFiltersProps) {
  return (
    <div className={styles.filters} role="search" aria-label={texts.label}>
      <TextField
        label={texts.searchLabel}
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {children}
    </div>
  );
}
