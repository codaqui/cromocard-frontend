import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { userDetailPathFor } from '@/routes/paths';

import type { SellerVerificationListItem } from '../../seller-verifications.types';
import { SellerRegistrationsTable } from './SellerRegistrationsTable';

const underReviewItem: SellerVerificationListItem = {
  id: 'ver-1',
  status: 'UNDER_REVIEW',
  legalName: 'Cards Kanto LTDA',
  cnpj: '45.291.802/0001-93',
  createdAt: '2026-10-20T15:00:00Z',
  seller: { id: 'seller-1', name: 'Fábio TCG Store', email: 'fabio@cromocard.dev' },
};

const approvedItem: SellerVerificationListItem = {
  ...underReviewItem,
  id: 'ver-2',
  status: 'APPROVED',
  seller: { id: 'seller-2', name: 'Loja Aprovada', email: 'aprovada@cromocard.dev' },
};

function renderTable(overrides: Partial<Parameters<typeof SellerRegistrationsTable>[0]> = {}) {
  render(
    <MemoryRouter>
      <SellerRegistrationsTable
        items={[underReviewItem]}
        meta={{ page: 1, pageSize: 20, total: 1, totalPages: 1 }}
        pendingCount={1}
        statusFilter="ALL"
        onStatusFilterChange={vi.fn()}
        onValidate={vi.fn()}
        onRefresh={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  );
}

describe('SellerRegistrationsTable', () => {
  it('CA1: mostra nome, e-mail, CNPJ, status e o total de pendentes', () => {
    renderTable();

    const row = screen.getByRole('row', { name: /Fábio TCG Store/ });
    expect(row).toHaveTextContent('fabio@cromocard.dev');
    expect(row).toHaveTextContent('45.291.802/0001-93');
    expect(row).toHaveTextContent('Em análise');
    expect(screen.getByText('1 pendente(s)')).toBeInTheDocument();
  });

  it('R2: mostra "Ver Informações" e "Validar Cadastro" quando o cadastro está em análise', () => {
    renderTable();

    const row = screen.getByRole('row', { name: /Fábio TCG Store/ });
    expect(
      within(row).getByRole('link', { name: 'Ver informações de Fábio TCG Store' }),
    ).toHaveAttribute('href', userDetailPathFor('seller-1'));
    expect(within(row).getByRole('button', { name: 'Validar Cadastro' })).toBeInTheDocument();
  });

  it('R2: cadastro aprovado só mostra "Ver Informações"', () => {
    renderTable({ items: [approvedItem] });

    const row = screen.getByRole('row', { name: /Loja Aprovada/ });
    expect(within(row).queryByRole('button', { name: 'Validar Cadastro' })).not.toBeInTheDocument();
  });

  it('R3: filtra por status', async () => {
    const onStatusFilterChange = vi.fn();
    renderTable({ onStatusFilterChange });

    await userEvent.selectOptions(screen.getByLabelText('Filtrar por status'), 'PENDING');

    expect(onStatusFilterChange).toHaveBeenCalledWith('PENDING');
  });

  it('R3: atualiza a fila', async () => {
    const onRefresh = vi.fn();
    renderTable({ onRefresh });

    await userEvent.click(screen.getByRole('button', { name: 'Atualizar Fila' }));

    expect(onRefresh).toHaveBeenCalled();
  });

  it('abre o painel de validação ao clicar em Validar Cadastro', async () => {
    const onValidate = vi.fn();
    renderTable({ onValidate });

    await userEvent.click(screen.getByRole('button', { name: 'Validar Cadastro' }));

    expect(onValidate).toHaveBeenCalledWith(underReviewItem);
  });

  it('mostra a mensagem de vazio quando não há cadastros', () => {
    renderTable({ items: [] });

    expect(
      screen.getByText('Não foram encontrados dados para os filtros selecionados'),
    ).toBeInTheDocument();
  });
});
