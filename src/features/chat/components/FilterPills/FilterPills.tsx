import { cn } from '@/utils/cn';

import styles from './FilterPills.module.css';

export interface FilterPill<TId extends string> {
  id: TId;
  label: string;
  count?: number;
}

interface FilterPillsProps<TId extends string> {
  label: string;
  items: FilterPill<TId>[];
  active: TId;
  onChange: (id: TId) => void;
  compact?: boolean;
}

interface PillProps<TId extends string> {
  item: FilterPill<TId>;
  active: boolean;
  onChange: (id: TId) => void;
}

function Pill<TId extends string>({ item, active, onChange }: PillProps<TId>) {
  return (
    <button
      type="button"
      className={cn(styles.pill, active && styles.active)}
      aria-pressed={active}
      onClick={() => onChange(item.id)}
    >
      {item.label}
      {item.count !== undefined && (
        <>
          {' '}
          <span className={styles.count}>{item.count}</span>
        </>
      )}
    </button>
  );
}

export function FilterPills<TId extends string>({
  label,
  items,
  active,
  onChange,
  compact = false,
}: FilterPillsProps<TId>) {
  return (
    <div className={cn(styles.pills, compact && styles.compact)} role="group" aria-label={label}>
      {items.map((item) => (
        <Pill key={item.id} item={item} active={item.id === active} onChange={onChange} />
      ))}
    </div>
  );
}
