import { Button } from '@/components/Button/Button';

import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

function pageNumbers(page: number, totalPages: number): number[] {
  const end = Math.min(totalPages, Math.max(3, page + 1));
  const start = Math.max(1, end - 2);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function RangeLabel({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <span className={styles.range}>
      Mostrando {from} a {to} de {total} usuários cadastrados
    </span>
  );
}

interface PageButtonProps {
  pageNumber: number;
  active: boolean;
  onClick: () => void;
}

function PageButton({ pageNumber, active, onClick }: PageButtonProps) {
  return (
    <Button
      variant={active ? 'primary' : 'secondary'}
      className={styles.pageButton}
      aria-current={active}
      onClick={onClick}
    >
      {pageNumber}
    </Button>
  );
}

interface PageControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PageControls({ page, totalPages, onPageChange }: PageControlsProps) {
  return (
    <div className={styles.pages}>
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </Button>
      {pageNumbers(page, totalPages).map((pageNumber) => (
        <PageButton
          key={pageNumber}
          pageNumber={pageNumber}
          active={pageNumber === page}
          onClick={() => onPageChange(pageNumber)}
        />
      ))}
      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      {total !== undefined && pageSize !== undefined && (
        <RangeLabel page={page} pageSize={pageSize} total={total} />
      )}
      <PageControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </nav>
  );
}
