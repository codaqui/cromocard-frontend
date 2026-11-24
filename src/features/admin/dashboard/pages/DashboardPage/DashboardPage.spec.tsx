import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeApi, sellerVerificationsApi } from '@/features/admin';

import { dashboardApi } from '../../dashboard.api';
import type { DashboardSummary, SignupsEvolution } from '../../dashboard.types';
import { DashboardPage } from './DashboardPage';

vi.mock('../../dashboard.api', () => ({
  dashboardApi: { getSummary: vi.fn(), getSignupsEvolution: vi.fn() },
}));

vi.mock('@/features/admin/finance/finance.api', () => ({
  financeApi: { getSummary: vi.fn(), getLedger: vi.fn(), getSellerStats: vi.fn() },
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
  kpis: {
    totalUsers: 1250,
    totalCards: null,
    newUsers: 4,
    newSellers: 2,
    collectors: 1200,
    sellers: 50,
    newCardsThisWeek: 0,
    usersVariation: null,
  },
  goal: null,
  signupsByMonth: [
    { month: '2026-09', customers: 1, sellers: 0 },
    { month: '2026-10', customers: 1, sellers: 2 },
  ],
  isEmpty: false,
};

const evolution: SignupsEvolution = {
  period: summary.period,
  bucket: 'day',
  points: [
    { at: '2026-10-28T03:00:00.000Z', collectors: 1, sellers: 0 },
    { at: '2026-10-29T03:00:00.000Z', collectors: 1, sellers: 1 },
  ],
  totals: { collectors: 2, sellers: 1 },
};

const emptyEvolution: SignupsEvolution = {
  ...evolution,
  points: evolution.points.map((point) => ({ ...point, collectors: 0, sellers: 0 })),
  totals: { collectors: 0, sellers: 0 },
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

const financeSummary = {
  period: { from: '2026-09-30T03:00:00Z', to: '2026-10-29T13:00:00Z' },
  custodyCents: 15000,
  settledCents: 10000,
  settledOrders: 2,
  retainedCents: 8000,
  hasMovement: true,
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
    vi.mocked(dashboardApi.getSignupsEvolution).mockReset().mockResolvedValue(evolution);
    vi.mocked(financeApi.getSummary).mockReset().mockResolvedValue(financeSummary);
    vi.mocked(financeApi.getSellerStats)
      .mockReset()
      .mockResolvedValue([{ id: 'seller-1', listedVolumeCents: 0, activeListings: 0 }]);
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
    expect(screen.getByRole('region', { name: 'Cartas no catálogo' })).toHaveTextContent('—');
    expect(screen.getByRole('region', { name: 'Novos cadastros' })).toHaveTextContent('4');
    expect(
      await screen.findByRole('region', {
        name: 'Evolução: Novos Cadastros vs Lojistas Certificados',
      }),
    ).toHaveTextContent('Colecionadores (+2)');
    expect(dashboardApi.getSignupsEvolution).toHaveBeenCalledWith({ period: '30d' });
    expect(await screen.findByRole('row', { name: /Fábio TCG Store/ })).toBeInTheDocument();
    expect(dashboardApi.getSummary).toHaveBeenCalledWith({ period: '30d' });
  });

  it('CA8: mostra o card de credenciamento com aprovados, pendentes e conversão', async () => {
    renderPage();

    const card = await screen.findByRole('region', { name: 'Lojistas & Credenciamento' });
    expect(card).toHaveTextContent('3 aprovados');
    expect(card).toHaveTextContent('1 Pendente');
    expect(card).not.toHaveTextContent('1 Pendentes');
    expect(card).toHaveTextContent('Conversão de 75% (aprovados ÷ analisados).');
  });

  it('CA8: usa o singular para 1 aprovado e o plural para vários pendentes', async () => {
    vi.mocked(sellerVerificationsApi.getSummary).mockResolvedValue({
      approved: 1,
      pending: 4,
      conversionRate: 0.5,
    });

    renderPage();

    const card = await screen.findByRole('region', { name: 'Lojistas & Credenciamento' });
    expect(card).toHaveTextContent('1 aprovado');
    expect(card).not.toHaveTextContent('1 aprovados');
    expect(card).toHaveTextContent('4 Pendentes');
  });

  it('R4: o card de credenciamento é o 4º da linha de indicadores, no lugar de "Novos vendedores"', async () => {
    renderPage();

    const card = await screen.findByRole('region', { name: 'Lojistas & Credenciamento' });
    const kpiRow = card.parentElement!;
    expect(within(kpiRow).getAllByRole('region')).toHaveLength(4);
    expect(kpiRow.lastElementChild).toBe(card);
    expect(screen.queryByRole('region', { name: 'Novos vendedores' })).not.toBeInTheDocument();
  });

  it('mostra "Novos vendedores" no 4º card enquanto o credenciamento não carrega', async () => {
    vi.mocked(sellerVerificationsApi.getSummary).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(await screen.findByRole('region', { name: 'Novos vendedores' })).toHaveTextContent('2');
  });

  it('L5: "Analisar Fila" filtra a lista de cadastros em Pendente', async () => {
    renderPage();
    await screen.findByRole('row', { name: /Fábio TCG Store/ });

    await userEvent.click(await screen.findByRole('link', { name: 'Analisar Fila' }));

    expect(screen.getByRole('link', { name: 'Analisar Fila' })).toHaveAttribute(
      'href',
      '#vendedores-recentes',
    );
    await vi.waitFor(() =>
      expect(sellerVerificationsApi.list).toHaveBeenLastCalledWith({
        status: 'PENDING',
        page: 1,
        pageSize: 20,
      }),
    );
    expect(screen.getByLabelText('Filtrar por status')).toHaveValue('PENDING');
  });

  it('CCD097 CA1: mostra a custódia, o liquidado e o retido ao lado do gráfico', async () => {
    renderPage();

    const card = await screen.findByRole('region', { name: 'Valor em custódia' });
    expect(card).toHaveTextContent(/R\$\s150,00/);
    expect(card).toHaveTextContent('Liquidado no período');
    expect(card).toHaveTextContent('2 pedidos liberados aos vendedores no período.');
    expect(financeApi.getSummary).toHaveBeenCalledWith({ period: '30d' });
    expect(
      screen.queryByRole('region', { name: 'Composição dos cadastros' }),
    ).not.toBeInTheDocument();
  });

  it('CCD097 CA2: no filtro Hoje, o card mostra "Liquidado hoje"', async () => {
    renderPage();
    await screen.findByRole('region', { name: 'Valor em custódia' });

    await userEvent.click(screen.getByRole('button', { name: 'Hoje' }));

    expect(financeApi.getSummary).toHaveBeenLastCalledWith({ period: 'today' });
    expect(await screen.findByText('Liquidado hoje')).toBeInTheDocument();
  });

  it('CCD097 CA5: mostra o volume anunciado de cada vendedor, sem coluna de reputação', async () => {
    renderPage();

    const row = await screen.findByRole('row', { name: /Fábio TCG Store/ });
    expect(await within(row).findByText('Nenhum anúncio ativo')).toBeInTheDocument();
    expect(financeApi.getSellerStats).toHaveBeenCalledWith(['seller-1']);
    expect(screen.queryByRole('columnheader', { name: 'Reputação' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Volume anunciado' })).toBeInTheDocument();
  });

  it('CA2: recalcula o dashboard ao escolher 7 dias', async () => {
    renderPage();
    await screen.findByRole('region', { name: 'Total de usuários' });

    await userEvent.click(screen.getByRole('button', { name: '7 dias' }));

    expect(dashboardApi.getSummary).toHaveBeenLastCalledWith({ period: '7d' });
    expect(dashboardApi.getSignupsEvolution).toHaveBeenLastCalledWith({ period: '7d' });
    expect(sellerVerificationsApi.getSummary).toHaveBeenLastCalledWith({ period: '7d' });
  });

  it('CA5: avisa quando não existem dados', async () => {
    vi.mocked(dashboardApi.getSummary).mockResolvedValue({ ...summary, isEmpty: true });

    renderPage();

    expect(await screen.findByText('Não existem dados para apresentação')).toBeInTheDocument();
  });

  it('CA5 (CCD096): avisa no gráfico quando o período não tem cadastros', async () => {
    vi.mocked(dashboardApi.getSummary).mockResolvedValue({
      ...summary,
      kpis: { ...summary.kpis, newUsers: 0, newSellers: 0 },
      signupsByMonth: [{ month: '2026-10', customers: 0, sellers: 0 }],
    });
    vi.mocked(dashboardApi.getSignupsEvolution).mockResolvedValue(emptyEvolution);

    renderPage();

    expect(await screen.findByText('Não há cadastros no período.')).toBeInTheDocument();
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
      address: null,
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

  it('mostra o erro da evolução e tenta de novo só o gráfico', async () => {
    vi.mocked(dashboardApi.getSignupsEvolution).mockRejectedValueOnce(
      new Error('Falhou a evolução'),
    );

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falhou a evolução');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Colecionadores (+2)')).toBeInTheDocument();
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
