import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardApi } from '../../dashboard.api';
import type { DashboardSummary } from '../../dashboard.types';
import { DashboardPage } from './DashboardPage';

vi.mock('../../dashboard.api', () => ({
  dashboardApi: { getSummary: vi.fn(), listRecentSellers: vi.fn() },
}));

const summary: DashboardSummary = {
  period: { from: '2026-09-30T03:00:00Z', to: '2026-10-29T13:00:00Z' },
  kpis: { totalUsers: 1250, totalCards: null, newUsers: 4, newSellers: 2 },
  signupsByMonth: [
    { month: '2026-09', customers: 1, sellers: 0 },
    { month: '2026-10', customers: 1, sellers: 2 },
  ],
  isEmpty: false,
};

const sellersPage = {
  data: [
    {
      id: '1',
      name: 'Fábio TCG Store',
      email: 'fabio@cromocard.dev',
      createdAt: '2026-10-20T15:00:00Z',
    },
  ],
  meta: { page: 1, pageSize: 5, total: 1, totalPages: 1 },
};

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(dashboardApi.getSummary).mockReset().mockResolvedValue(summary);
    vi.mocked(dashboardApi.listRecentSellers).mockReset().mockResolvedValue(sellersPage);
  });

  it('mostra o carregando enquanto busca os dados', () => {
    vi.mocked(dashboardApi.getSummary).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o dashboard…');
  });

  it('CA1: mostra os KPIs dos últimos 30 dias, o gráfico e os vendedores', async () => {
    renderPage();

    expect(await screen.findByRole('region', { name: 'Total de usuários' })).toHaveTextContent(
      '1.250',
    );
    expect(screen.getByRole('region', { name: 'Cartas cadastradas' })).toHaveTextContent('—');
    expect(screen.getByRole('region', { name: 'Novos cadastros' })).toHaveTextContent('4');
    expect(screen.getByRole('img', { name: /Novos cadastros por mês/ })).toBeInTheDocument();
    expect(await screen.findByRole('row', { name: /Fábio TCG Store/ })).toBeInTheDocument();
    expect(dashboardApi.getSummary).toHaveBeenCalledWith({ period: '30d' });
  });

  it('CA2: recalcula o dashboard e a lista ao escolher 7 dias', async () => {
    renderPage();
    await screen.findByRole('region', { name: 'Total de usuários' });

    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(dashboardApi.getSummary).toHaveBeenLastCalledWith({ period: '7d' });
    expect(dashboardApi.listRecentSellers).toHaveBeenLastCalledWith({
      period: '7d',
      page: 1,
      pageSize: 5,
    });
  });

  it('CA5: avisa quando não existem dados', async () => {
    vi.mocked(dashboardApi.getSummary).mockResolvedValue({ ...summary, isEmpty: true });

    renderPage();

    expect(await screen.findByText('Não existem dados para apresentação')).toBeInTheDocument();
  });

  it('CA6: avisa quando o período não tem cadastros', async () => {
    vi.mocked(dashboardApi.getSummary).mockResolvedValue({
      ...summary,
      kpis: { ...summary.kpis, newUsers: 0, newSellers: 0 },
      signupsByMonth: [{ month: '2026-10', customers: 0, sellers: 0 }],
    });
    vi.mocked(dashboardApi.listRecentSellers).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 },
    });

    renderPage();

    await screen.findByRole('table', { name: 'Cadastros de vendedores recentes' });
    expect(
      screen.getAllByText('Não foram encontrados dados para os filtros selecionados'),
    ).toHaveLength(2);
    expect(screen.getByRole('region', { name: 'Total de usuários' })).toBeInTheDocument();
  });

  it('volta a lista de vendedores para a página 1 ao trocar o período', async () => {
    vi.mocked(dashboardApi.listRecentSellers).mockResolvedValue({
      ...sellersPage,
      meta: { page: 1, pageSize: 5, total: 12, totalPages: 3 },
    });
    renderPage();
    await screen.findByRole('row', { name: /Fábio TCG Store/ });

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(dashboardApi.listRecentSellers).toHaveBeenLastCalledWith({
      period: '7d',
      page: 1,
      pageSize: 5,
    });
  });

  it('CA8: mostra o erro e tenta de novo', async () => {
    vi.mocked(dashboardApi.getSummary).mockRejectedValueOnce(new Error('Serviço indisponível'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Serviço indisponível');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('region', { name: 'Total de usuários' })).toBeInTheDocument();
  });
});
