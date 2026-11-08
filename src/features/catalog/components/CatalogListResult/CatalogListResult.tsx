import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import type { PaginatedResponse } from '@/types/api';

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
}: CatalogListResultProps<T>) {
  const isSteppingBack = useStepBackFromEmptyPage(query.data, onPageChange);

  if (query.isPending || isSteppingBack) return <LoadingState />;
  if (query.isError) {
    return <ListError message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (query.data.data.length === 0) return <EmptyState title={table.emptyTitle} />;

  const { meta } = query.data;
  return (
    <>
      <DataTable
        caption={table.caption}
        columns={table.columns}
        rows={query.data.data}
        getRowKey={(row) => row.id}
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </>
  );
}
