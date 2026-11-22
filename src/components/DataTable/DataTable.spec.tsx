import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

  it('com onRowClick, clicar na linha entrega o registro dela', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        caption="Vendedores recentes"
        columns={columns}
        rows={sellers}
        getRowKey={(seller) => seller.id}
        onRowClick={onRowClick}
      />,
    );

    await userEvent.click(screen.getByText('Fábio TCG Store'));

    expect(onRowClick).toHaveBeenCalledWith(sellers[1]);
  });

  it('a área de rolagem é uma região nomeada pela legenda e alcançável pelo teclado', () => {
    render(
      <DataTable
        caption="Vendedores recentes"
        columns={columns}
        rows={sellers}
        getRowKey={(seller) => seller.id}
      />,
    );

    const region = screen.getByRole('region', { name: 'Tabela Vendedores recentes' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.className).not.toMatch(/flat|pinned/);
  });

  it('flat e pinLastColumn marcam a tabela sem borda e com a última coluna fixa', () => {
    render(
      <DataTable
        flat
        pinLastColumn
        caption="Vendedores recentes"
        columns={columns}
        rows={sellers}
        getRowKey={(seller) => seller.id}
      />,
    );

    const { className } = screen.getByRole('region', { name: 'Tabela Vendedores recentes' });
    expect(className).toMatch(/flat/);
    expect(className).toMatch(/pinned/);
  });
});
