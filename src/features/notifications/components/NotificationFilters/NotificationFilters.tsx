import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { centralFilters, notificationsTexts as t } from '../../notifications.labels';
import type { NotificationCounts, NotificationFilter } from '../../notifications.types';
import styles from './NotificationFilters.module.css';

interface NotificationFiltersProps {
  active: NotificationFilter;
  counts?: NotificationCounts;
  onChange: (filter: NotificationFilter) => void;
}

interface FilterButtonProps {
  value: NotificationFilter;
  label: string;
  isActive: boolean;
  count?: number;
  onSelect: (filter: NotificationFilter) => void;
}

function FilterButton({ value, label, isActive, count, onSelect }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={cn(styles.filter, isActive && styles.active)}
      aria-pressed={isActive}
      onClick={() => onSelect(value)}
    >
      {value !== 'ALL' && <span className={cn(styles.dot, styles[value])} aria-hidden="true" />}
      {label}
      {count !== undefined && ' '}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}

export function NotificationFilters({ active, counts, onChange }: NotificationFiltersProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.filters} role="group" aria-label="Filtrar notificações">
        {centralFilters.map(({ value, label }) => (
          <FilterButton
            key={value}
            value={value}
            label={label}
            isActive={value === active}
            count={counts?.[value]}
            onSelect={onChange}
          />
        ))}
      </div>
      <span className={styles.sort}>
        <Icon name="sort" size={16} />
        {t.newestFirst}
      </span>
    </div>
  );
}
