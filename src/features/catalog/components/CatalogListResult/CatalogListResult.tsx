import type { UseQueryResult } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';

import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import type { PaginatedResponse } from '@/types/api';

import { CatalogPagination } from '../CatalogPagination/CatalogPagination';
import styles from './CatalogListResult.module.css';

export interface CatalogTable<T> {
  caption: string;
  emptyTitle: string;
  columns: DataTableColumn<T>[];
}

interface CatalogListResultProps<T extends { id: string }> {
  query: UseQueryResult<PaginatedResponse<T>>;
  table: CatalogTable<T>;
  onPageChange: (page: number) => void;
  footer?: ReactNode;
}

function previousPageWithItems<T>(result?: PaginatedResponse<T>): number | null {
  if (!result || result.data.length > 0 || result.meta.page <= 1) return null;
  return Math.max(1, Math.min(result.meta.page - 1, result.meta.totalPages));
}

function useStepBackFromEmptyPage<T>(
  result: PaginatedResponse<T> | undefined,
  onPageChange: (page: number) => void,
): boolean {
  const previousPage = previousPageWithItems(result);

  useEffect(() => {
    if (previousPage) onPageChange(previousPage);
  }, [previousPage, onPageChange]);

  return previousPage !== null;
}

function ListError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.error}>
      <ErrorState message={message} />
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}

export function CatalogListResult<T extends { id: string }>({
  query,
  table,
  onPageChange,
  footer,
}: CatalogListResultProps<T>) {
  const isSteppingBack = useStepBackFromEmptyPage(query.data, onPageChange);

  if (query.isPending || isSteppingBack) return <LoadingState />;
  if (query.isError) {
    return <ListError message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (query.data.data.length === 0) return <EmptyState title={table.emptyTitle} />;

  return <ListPage page={query.data} table={table} onPageChange={onPageChange} footer={footer} />;
}

interface ListPageProps<T> extends Omit<CatalogListResultProps<T & { id: string }>, 'query'> {
  page: PaginatedResponse<T & { id: string }>;
}

function ListPage<T>({ page, table, onPageChange, footer }: ListPageProps<T>) {
  const { data: rows, meta } = page;

  return (
    <div className={styles.result}>
      <DataTable
        caption={table.caption}
        columns={table.columns}
        rows={rows}
        getRowKey={(row) => row.id}
        pinLastColumn
      />
      <CatalogPagination meta={meta} shown={rows.length} onPageChange={onPageChange}>
        {footer}
      </CatalogPagination>
    </div>
  );
}
