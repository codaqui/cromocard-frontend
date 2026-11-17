import { cn } from '@/utils/cn';

import type { AuditActionTone } from '../../audit-logs.labels';
import type { AuditAction } from '../../audit-logs.types';
import styles from './AuditLogFilters.module.css';

interface QuickFilter {
  action: AuditAction;
  label: string;
  tone: AuditActionTone;
}

const QUICK_FILTERS: QuickFilter[] = [
  { action: 'USER_SUSPENDED', label: 'Suspensões de Usuários', tone: 'danger' },
  { action: 'GROUP_DELETED', label: 'Exclusões de Grupos', tone: 'warning' },
  { action: 'USER_ROLE_UPDATED', label: 'Alterações de Papel', tone: 'info' },
];

interface QuickFiltersProps {
  active?: AuditAction;
  shown: number;
  onToggle: (action: AuditAction) => void;
}

export function QuickFilters({ active, shown, onToggle }: QuickFiltersProps) {
  return (
    <div className={styles.quickBar}>
      <div role="group" aria-label="Filtros rápidos" className={styles.quickList}>
        <span className={styles.quickLabel}>Filtros rápidos:</span>
        {QUICK_FILTERS.map((filter) => (
          <button
            key={filter.action}
            type="button"
            aria-pressed={active === filter.action}
            className={cn(styles.chip, active === filter.action && styles.chipActive)}
            onClick={() => onToggle(filter.action)}
          >
            <span className={cn(styles.dot, styles[filter.tone])} aria-hidden="true" />
            {filter.label}
          </button>
        ))}
      </div>
      <p className={styles.summary}>
        Mostrando <strong>{shown}</strong> {shown === 1 ? 'evento' : 'eventos'} nesta página
      </p>
    </div>
  );
}
