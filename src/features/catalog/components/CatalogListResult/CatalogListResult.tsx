import type { UseQueryResult } from '@tanstack/react-query';

import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import type { PaginatedResponse } from '@/types/api';

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

export function CatalogListResult<T extends { id: string }>({
  query,
  table,
  onPageChange,
}: CatalogListResultProps<T>) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} />;
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
