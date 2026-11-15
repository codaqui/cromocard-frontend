import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import type { PaginatedResponse } from '@/types/api';

import { CatalogListResult, type CatalogTable } from './CatalogListResult';

interface Row {
  id: string;
  name: string;
}

const table: CatalogTable<Row> = {
  caption: 'Itens',
  emptyTitle: 'Nenhum item encontrado',
  columns: [{ key: 'name', header: 'Nome', render: (row) => row.name }],
};

function pageOf(rows: Row[], page: number, totalPages: number): PaginatedResponse<Row> {
  return { data: rows, meta: { page, pageSize: 20, total: rows.length, totalPages } };
}

function queryWith(state: Partial<UseQueryResult<PaginatedResponse<Row>>>) {
  return {
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...state,
  } as unknown as UseQueryResult<PaginatedResponse<Row>>;
}

function renderResult(query: UseQueryResult<PaginatedResponse<Row>>) {
  const onPageChange = vi.fn();
  render(<CatalogListResult query={query} table={table} onPageChange={onPageChange} />);
  return onPageChange;
}

describe('CatalogListResult', () => {
  it('volta para a página anterior quando a página atual fica vazia', () => {
    const onPageChange = renderResult(queryWith({ data: pageOf([], 3, 2) }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.queryByText('Nenhum item encontrado')).not.toBeInTheDocument();
  });

  it('mostra o estado vazio na primeira página', () => {
    const onPageChange = renderResult(queryWith({ data: pageOf([], 1, 0) }));

    expect(screen.getByText('Nenhum item encontrado')).toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('mostra o erro com tentar de novo', async () => {
    const refetch = vi.fn();
    renderResult(
      queryWith({
        isError: true,
        error: new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Falha na lista' }),
        refetch,
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(screen.getByText('Falha na lista')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
