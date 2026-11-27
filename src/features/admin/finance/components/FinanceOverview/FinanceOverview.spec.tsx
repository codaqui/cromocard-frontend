import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeApi } from '../../finance.api';
import type { FinanceSummary, LedgerMeta } from '../../finance.types';
import { FinanceOverview } from './FinanceOverview';

vi.mock('../../finance.api', () => ({
  financeApi: { getSummary: vi.fn(), getLedger: vi.fn() },
}));

const summary: FinanceSummary = {
  period: { from: '2026-11-12T03:00:00.000Z', to: '2026-11-13T03:00:00.000Z' },
  custodyCents: 4520000,
  settledCents: 240000,
  settledOrders: 1,
  retainedCents: 64235000,
  hasMovement: true,
};

const ledgerMeta: LedgerMeta = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0,
  totals: { receivedCents: 0, releasedCents: 0, retainedCents: 0 },
  day: { from: '2026-11-12T03:00:00.000Z', to: '2026-11-13T03:00:00.000Z' },
};

function renderOverview() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <FinanceOverview params={{ period: 'today' }} isToday />
    </QueryClientProvider>,
  );
}

describe('FinanceOverview', () => {
  beforeEach(() => {
    vi.mocked(financeApi.getSummary).mockReset().mockResolvedValue(summary);
    vi.mocked(financeApi.getLedger).mockReset().mockResolvedValue({ data: [], meta: ledgerMeta });
  });

  it('R7: abre e fecha o livro razão pelo card de custódia', async () => {
    renderOverview();

    await userEvent.click(await screen.findByRole('button', { name: 'Ver Livro Razão de Hoje' }));
    expect(await screen.findByRole('dialog', { name: 'Livro Razão de Hoje' })).toBeInTheDocument();

    const [, footerClose] = screen.getAllByRole('button', { name: 'Fechar' });
    await userEvent.click(footerClose!);
    expect(screen.queryByRole('dialog', { name: 'Livro Razão de Hoje' })).not.toBeInTheDocument();
  });

  it('mostra o carregando e depois o erro da API', async () => {
    vi.mocked(financeApi.getSummary).mockRejectedValue(new Error('Servidor indisponível'));
    renderOverview();

    expect(screen.getByText('Carregando os valores do marketplace…')).toBeInTheDocument();
    expect(await screen.findByText('Servidor indisponível')).toBeInTheDocument();
  });
});
