import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sellerVerificationsApi } from '@/features/admin';

import { dashboardApi } from '../../dashboard.api';
import type { DashboardSummary } from '../../dashboard.types';
import { DashboardPage } from './DashboardPage';

vi.mock('../../dashboard.api', () => ({
  dashboardApi: { getSummary: vi.fn() },
}));

vi.mock('@/features/admin/seller-verifications/seller-verifications.api', () => ({
  sellerVerificationsApi: {
    list: vi.fn(),
    getSummary: vi.fn(),
    getById: vi.fn(),
    validateDocument: vi.fn(),
    addNote: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  },
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

const sellerVerificationsPage = {
  data: [
    {
      id: 'ver-1',
      status: 'UNDER_REVIEW' as const,
      legalName: 'Cards Kanto LTDA',
      cnpj: '45.291.802/0001-93',
      createdAt: '2026-10-20T15:00:00Z',
      seller: { id: 'seller-1', name: 'Fábio TCG Store', email: 'fabio@cromocard.dev' },
    },
  ],
  meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
};

const sellerVerificationsSummary = { approved: 3, pending: 1, conversionRate: 0.75 };

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
    vi.mocked(sellerVerificationsApi.list).mockReset().mockResolvedValue(sellerVerificationsPage);
    vi.mocked(sellerVerificationsApi.getSummary)
      .mockReset()
      .mockResolvedValue(sellerVerificationsSummary);
  });

  it('mostra o carregando enquanto busca os dados', () => {
    vi.mocked(dashboardApi.getSummary).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o dashboard…');
  });

  it('CA1: mostra os KPIs dos últimos 30 dias, o gráfico e os vendedores em análise', async () => {
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

  it('CA8: mostra o card de credenciamento com aprovados e conversão', async () => {
    renderPage();

    const card = await screen.findByRole('region', { name: 'Lojistas & Credenciamento' });
    expect(card).toHaveTextContent('75%');
    expect(card).toHaveTextContent('3');
  });

  it('CA2: recalcula o dashboard ao escolher 7 dias', async () => {
    renderPage();
    await screen.findByRole('region', { name: 'Total de usuários' });

    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(dashboardApi.getSummary).toHaveBeenLastCalledWith({ period: '7d' });
    expect(sellerVerificationsApi.getSummary).toHaveBeenLastCalledWith({ period: '7d' });
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

    renderPage();

    expect(
      await screen.findByText('Não foram encontrados dados para os filtros selecionados'),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Total de usuários' })).toBeInTheDocument();
  });

  it('R3: filtra os cadastros de vendedores por status', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Fábio TCG Store/ });

    await userEvent.selectOptions(screen.getByLabelText('Filtrar por status'), 'PENDING');

    await vi.waitFor(() =>
      expect(sellerVerificationsApi.list).toHaveBeenLastCalledWith({
        status: 'PENDING',
        page: 1,
        pageSize: 20,
      }),
    );
  });

  it('abre o painel de validação ao clicar em Validar Cadastro', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Fábio TCG Store/ });
    vi.mocked(sellerVerificationsApi.getById).mockResolvedValue({
      ...sellerVerificationsPage.data[0]!,
      tradeName: null,
      stateRegistration: null,
      openingDate: null,
      companySize: null,
      cnae: null,
      responsibleName: 'Fábio Silva',
      responsibleCpf: '52998224725',
      responsiblePhone: null,
      bankName: null,
      bankBranch: null,
      bankAccount: null,
      pixKey: null,
      rejectionReason: null,
      reviewedAt: null,
      documents: [],
      notes: [],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Validar Cadastro' }));

    expect(await screen.findByRole('heading', { name: 'Validar Cadastro' })).toBeInTheDocument();
  });

  it('CA8: mostra o erro e tenta de novo', async () => {
    vi.mocked(dashboardApi.getSummary).mockRejectedValueOnce(new Error('Serviço indisponível'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Serviço indisponível');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('region', { name: 'Total de usuários' })).toBeInTheDocument();
  });

  it('mostra o erro dos vendedores e tenta de novo', async () => {
    vi.mocked(sellerVerificationsApi.list).mockRejectedValueOnce(new Error('Fila indisponível'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Fila indisponível');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('row', { name: /Fábio TCG Store/ })).toBeInTheDocument();
  });

  it('atualiza a fila ao clicar em Atualizar Fila', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Fábio TCG Store/ });
    vi.mocked(sellerVerificationsApi.list).mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'Atualizar Fila' }));

    await vi.waitFor(() => expect(sellerVerificationsApi.list).toHaveBeenCalled());
  });
});
