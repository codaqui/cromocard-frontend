import { cn } from '@/utils/cn';

import { filterLabels } from '../../chat.labels';
import type { ConversationFilter } from '../../chat.types';
import styles from './ConversationFilters.module.css';

interface ConversationFiltersProps {
  active: ConversationFilter;
  totals: Record<ConversationFilter, number>;
  onChange: (filter: ConversationFilter) => void;
}

const filters: ConversationFilter[] = ['all', 'unread'];

export function ConversationFilters({ active, totals, onChange }: ConversationFiltersProps) {
  return (
    <div className={styles.filters} role="group" aria-label="Filtrar conversas">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={cn(styles.filter, filter === active && styles.active)}
          aria-pressed={filter === active}
          onClick={() => onChange(filter)}
        >
          {filterLabels[filter]}
          {totals.all > 0 && (
            <>
              {' '}
              <span className={styles.count}>{totals[filter]}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
