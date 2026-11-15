import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './AuditLogsTable.module.css';
import { type PagerItem, pagerItems } from './pager-items';

interface AuditLogsPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface ArrowProps {
  label: string;
  icon: IconName;
  disabled: boolean;
  onClick: () => void;
}

function Arrow({ label, icon, disabled, onClick }: ArrowProps) {
  return (
    <button
      type="button"
      className={styles.pageArrow}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function PagerEntry({
  item,
  page,
  onPageChange,
}: { item: PagerItem } & Omit<AuditLogsPagerProps, 'totalPages'>) {
  if (typeof item !== 'number') {
    return (
      <span className={styles.pageGap} aria-hidden="true">
        …
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-current={item === page ? 'page' : undefined}
      aria-label={`Página ${item}`}
      className={cn(styles.pageButton, item === page && styles.pageActive)}
      onClick={() => onPageChange(item)}
    >
      {item}
    </button>
  );
}

export function AuditLogsPager({ page, totalPages, onPageChange }: AuditLogsPagerProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pager} aria-label="Paginação dos registros">
      <Arrow
        label="Página anterior"
        icon="chevronLeft"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {pagerItems(page, totalPages).map((item) => (
        <PagerEntry key={item} item={item} page={page} onPageChange={onPageChange} />
      ))}
      <Arrow
        label="Próxima página"
        icon="chevronRight"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
