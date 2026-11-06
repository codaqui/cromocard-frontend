import { cn } from '@/utils/cn';

import styles from './RecentSellersTable.module.css';

const VISIBLE_PAGES = 3;

interface SellersPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function visiblePages(page: number, totalPages: number): number[] {
  const first = Math.max(1, Math.min(page - 1, totalPages - VISIBLE_PAGES + 1));
  const count = Math.min(VISIBLE_PAGES, totalPages);
  return Array.from({ length: count }, (_, index) => first + index);
}

export function SellersPager({ page, totalPages, onPageChange }: SellersPagerProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pager} aria-label="Paginação dos vendedores">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      {visiblePages(page, totalPages).map((number) => (
        <button
          key={number}
          type="button"
          aria-current={number === page ? 'page' : undefined}
          aria-label={`Página ${number}`}
          className={cn(number === page && styles.currentPage)}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Próximo
      </button>
    </nav>
  );
}
