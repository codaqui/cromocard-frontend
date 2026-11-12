import type { PaginationMeta } from '@/types/api';
import { cn } from '@/utils/cn';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { formatCount } from '../../catalog.format';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import { pageSlots } from './catalog-pages';
import styles from './CatalogPagination.module.css';

interface CatalogPaginationProps {
  meta: PaginationMeta;
  shown: number;
  onPageChange: (page: number) => void;
}

interface StepButtonProps {
  label: string;
  icon: CatalogIconName;
  target: number;
  disabled: boolean;
  onPageChange: (page: number) => void;
}

function StepButton({ label, icon, target, disabled, onPageChange }: StepButtonProps) {
  return (
    <button
      type="button"
      className={styles.step}
      aria-label={label}
      disabled={disabled}
      onClick={() => onPageChange(target)}
    >
      <CatalogIcon name={icon} />
    </button>
  );
}

function PageNumbers({ meta, onPageChange }: Omit<CatalogPaginationProps, 'shown'>) {
  return pageSlots(meta.page, meta.totalPages).map((slot, index) =>
    slot === 'gap' ? (
      <span key={`gap-${index}`} className={styles.gap} aria-hidden="true">
        …
      </span>
    ) : (
      <button
        key={slot}
        type="button"
        className={cn(styles.page, slot === meta.page && styles.current)}
        aria-current={slot === meta.page ? 'page' : undefined}
        aria-label={`Página ${slot}`}
        onClick={() => onPageChange(slot)}
      >
        {slot}
      </button>
    ),
  );
}

type Step = Omit<StepButtonProps, 'onPageChange'>;

function backwardSteps({ page }: PaginationMeta): Step[] {
  const disabled = page <= 1;
  return [
    { label: 'Primeira página', icon: 'firstPage', target: 1, disabled },
    { label: 'Página anterior', icon: 'chevronLeft', target: page - 1, disabled },
  ];
}

function forwardSteps({ page, totalPages }: PaginationMeta): Step[] {
  const disabled = page >= totalPages;
  return [
    { label: 'Próxima página', icon: 'chevronRight', target: page + 1, disabled },
    { label: 'Última página', icon: 'lastPage', target: totalPages, disabled },
  ];
}

function PageControls({ meta, onPageChange }: Omit<CatalogPaginationProps, 'shown'>) {
  const renderStep = (step: Step) => (
    <StepButton key={step.label} {...step} onPageChange={onPageChange} />
  );

  return (
    <div className={styles.controls}>
      {backwardSteps(meta).map(renderStep)}
      <PageNumbers meta={meta} onPageChange={onPageChange} />
      {forwardSteps(meta).map(renderStep)}
    </div>
  );
}

function RangeLabel({ meta, shown }: Omit<CatalogPaginationProps, 'onPageChange'>) {
  const from = shown === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const to = from === 0 ? 0 : from + shown - 1;

  return (
    <p className={styles.range}>
      Mostrando registros{' '}
      <strong>
        {from} - {to}
      </strong>{' '}
      de <strong>{formatCount(meta.total)} itens</strong>
    </p>
  );
}

export function CatalogPagination({ meta, shown, onPageChange }: CatalogPaginationProps) {
  return (
    <nav className={styles.footer} aria-label="Paginação">
      <RangeLabel meta={meta} shown={shown} />
      {meta.totalPages > 1 && <PageControls meta={meta} onPageChange={onPageChange} />}
    </nav>
  );
}
