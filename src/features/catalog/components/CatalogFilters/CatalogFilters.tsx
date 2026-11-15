import type { ReactNode } from 'react';

import { ActiveFilters, type FilterChip } from '../ActiveFilters/ActiveFilters';
import { CatalogSearchField } from '../CatalogSearchField/CatalogSearchField';
import styles from './CatalogFilters.module.css';

export interface CatalogFiltersTexts {
  label: string;
  searchLabel: string;
  searchPlaceholder: string;
}

export interface CatalogFiltersState {
  search: string;
  chips: FilterChip[];
  summary?: string;
  onSearchChange: (value: string) => void;
  onClearAll: () => void;
}

interface CatalogFiltersProps {
  texts: CatalogFiltersTexts;
  state: CatalogFiltersState;
  children?: ReactNode;
}

export function CatalogFilters({ texts, state, children }: CatalogFiltersProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.filters} role="search" aria-label={texts.label}>
        <CatalogSearchField
          label={texts.searchLabel}
          placeholder={texts.searchPlaceholder}
          value={state.search}
          onChange={state.onSearchChange}
        />
        {children}
      </div>
      <ActiveFilters chips={state.chips} summary={state.summary} onClearAll={state.onClearAll} />
    </div>
  );
}
