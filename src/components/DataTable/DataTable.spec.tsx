import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/Badge/Badge';

import { DataTable, type DataTableColumn } from './DataTable';

interface Seller {
  id: string;
  name: string;
  status: string;
}

const columns: DataTableColumn<Seller>[] = [
  { key: 'name', header: 'Vendedor', render: (seller) => seller.name },
  { key: 'status', header: 'Situação', render: (seller) => <Badge>{seller.status}</Badge> },
];

const sellers: Seller[] = [
  { id: '1', name: 'Elisa Cartas Raras', status: 'Ativo' },
  { id: '2', name: 'Fábio TCG Store', status: 'Pendente' },
];

describe('DataTable', () => {
  it('mostra os cabeçalhos e uma linha por registro', () => {
    render(
      <DataTable
        caption="Vendedores recentes"
        columns={columns}
        rows={sellers}
        getRowKey={(seller) => seller.id}
      />,
    );

    const table = screen.getByRole('table', { name: 'Vendedores recentes' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Vendedor', 'Situação']);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByRole('row', { name: /Fábio TCG Store/ })).toHaveTextContent(
      'Pendente',
    );
  });

  it('mostra a mensagem de vazio quando não há registros', () => {
    render(
      <DataTable
        caption="Vendedores recentes"
        columns={columns}
        rows={[]}
        getRowKey={(seller) => seller.id}
        emptyMessage="Nenhum vendedor no período"
      />,
    );

    expect(screen.getByRole('cell', { name: 'Nenhum vendedor no período' })).toHaveAttribute(
      'colspan',
      '2',
    );
  });
});
