import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import { dashboardApi } from '../../dashboard.api';
import type {
  DashboardKpis as Kpis,
  DashboardSummary,
  SellerCredentialing,
} from '../../dashboard.types';
import { DashboardKpis } from './DashboardKpis';

vi.mock('../../dashboard.api', () => ({
  dashboardApi: { getSignupsEvolution: vi.fn() },
}));

const kpis: Kpis = {
  totalUsers: 48920,
  totalCards: 184350,
  newUsers: 4218,
  newSellers: 148,
  collectors: 47390,
  sellers: 1530,
  newCardsThisWeek: 3120,
  usersVariation: 12.4,
};

const summaryOf = (changes: Partial<DashboardSummary> = {}): DashboardSummary => ({
  period: { from: '2026-10-13T03:00:00Z', to: '2026-11-11T16:00:00Z' },
  kpis,
  goal: { monthly: 4000, percent: 105 },
  signupsByMonth: [],
  isEmpty: false,
  ...changes,
});

const withKpis = (changes: Partial<Kpis>, rest: Partial<DashboardSummary> = {}) =>
  summaryOf({ kpis: { ...kpis, ...changes }, ...rest });

function renderKpis(
  summary: DashboardSummary,
  period: Period = { preset: '30d' },
  credentialing?: SellerCredentialing,
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardKpis
        summary={summary}
        period={period}
        params={{ period: '30d' }}
        credentialing={credentialing}
      />
    </QueryClientProvider>,
  );
}

const describedPeriods: [Period, string][] = [
  [{ preset: 'today' }, 'Novos cadastros hoje.'],
  [{ preset: '1y' }, 'Novos cadastros nos últimos 12 meses.'],
  [{ from: '2026-10-01', to: '2026-10-31' }, 'Novos cadastros no período selecionado.'],
];

const tile = (name: string) => screen.getByRole('region', { name });

describe('DashboardKpis', () => {
  beforeEach(() => {
    vi.mocked(dashboardApi.getSignupsEvolution)
      .mockReset()
      .mockResolvedValue({
        period: summaryOf().period,
        bucket: 'day',
        points: [
          { at: '2026-11-10T03:00:00.000Z', collectors: 3, sellers: 1 },
          { at: '2026-11-11T03:00:00.000Z', collectors: 5, sellers: 0 },
        ],
        totals: { collectors: 8, sellers: 1 },
      });
  });

  it('R2: a minilinha de novos cadastros usa os pontos da evolução do período', async () => {
    const { container } = renderKpis(summaryOf());

    await waitFor(() => expect(container.querySelector('svg path')).toBeInTheDocument());
    expect(dashboardApi.getSignupsEvolution).toHaveBeenCalledWith({ period: '30d' });
  });

  it('R9, R10: o total de usuários mostra a variação e a divisão por papel', () => {
    renderKpis(summaryOf());

    const users = tile('Total de usuários');
    expect(users).toHaveTextContent('48.920 usuários');
    expect(users).toHaveTextContent('+12,4%');
    expect(users).toHaveTextContent(
      'Clientes e vendedores, sem administradores e sem contas excluídas.',
    );
    expect(users).toHaveTextContent('Colecionadores47.390');
    expect(users).toHaveTextContent('Lojistas1.530');
  });

  it('CA6: 100 contra 80 cadastros mostra +25%', () => {
    renderKpis(withKpis({ usersVariation: 25 }));

    expect(tile('Total de usuários')).toHaveTextContent('+25%');
  });

  it('L2: sem cadastros no período anterior, mostra "Novo"', () => {
    renderKpis(withKpis({ usersVariation: null }));

    expect(tile('Total de usuários')).toHaveTextContent('Novo');
  });

  it('L4: mostra 0% quando os dois períodos não têm cadastros', () => {
    renderKpis(withKpis({ usersVariation: 0 }));
    expect(tile('Total de usuários')).toHaveTextContent('0%');
  });

  it('mostra a queda com o sinal de menos', () => {
    renderKpis(withKpis({ usersVariation: -5.2 }));

    expect(tile('Total de usuários')).toHaveTextContent('-5,2%');
  });

  it('R11: o card do catálogo mostra as novas cartas da semana', () => {
    renderKpis(summaryOf());

    expect(tile('Cartas no catálogo')).toHaveTextContent('184.350 cartas');
    expect(tile('Cartas no catálogo')).toHaveTextContent('+3.120 novas cartas esta semana');
  });

  it('avisa quando o catálogo ainda não está ligado', () => {
    renderKpis(withKpis({ totalCards: null }));

    expect(tile('Cartas no catálogo')).toHaveTextContent(
      'A contagem aparece quando o catálogo estiver no ar.',
    );
  });

  it('CA3: em 30 dias, mostra o percentual da meta e a meta superada', () => {
    renderKpis(summaryOf());

    const signups = tile('Novos cadastros');
    expect(signups).toHaveTextContent('+4.218');
    expect(signups).toHaveTextContent('105% da Meta');
    expect(signups).toHaveTextContent('Meta mensal de 4.000 cadastros superada.');
  });

  it('R3: a meta atingida e a meta ainda não alcançada', () => {
    renderKpis(summaryOf({ goal: { monthly: 4218, percent: 100 } }));
    expect(tile('Novos cadastros')).toHaveTextContent('Meta mensal de 4.218 cadastros atingida.');
  });

  it('R3: abaixo da meta, mostra só a meta mensal', () => {
    renderKpis(summaryOf({ goal: { monthly: 5000, percent: 84 } }));

    expect(tile('Novos cadastros')).toHaveTextContent('84% da Meta');
    expect(tile('Novos cadastros')).toHaveTextContent('Meta mensal de 5.000 cadastros.');
  });

  it('CA4: sem meta configurada, mostra o total sem percentual', () => {
    renderKpis(summaryOf({ goal: null }));

    expect(tile('Novos cadastros')).toHaveTextContent('+4.218');
    expect(tile('Novos cadastros')).not.toHaveTextContent('% da Meta');
    expect(tile('Novos cadastros')).toHaveTextContent('Meta mensal não configurada.');
  });

  it('CA8: em 7 dias, mostra o total sem o percentual da meta', () => {
    renderKpis(withKpis({ newUsers: 1120 }, { goal: { monthly: 4000, percent: null } }), {
      preset: '7d',
    });

    expect(tile('Novos cadastros')).toHaveTextContent('+1.120');
    expect(tile('Novos cadastros')).not.toHaveTextContent('% da Meta');
    expect(tile('Novos cadastros')).toHaveTextContent('Novos cadastros nos últimos 7 dias.');
  });

  it.each(describedPeriods)('R3: descreve o período %o', (period, text) => {
    renderKpis(summaryOf({ goal: { monthly: 4000, percent: null } }), period);

    expect(tile('Novos cadastros')).toHaveTextContent(text);
  });

  it('CA5: sem cadastros no período, mostra 0 e a mensagem', () => {
    renderKpis(withKpis({ newUsers: 0, usersVariation: 0 }), {
      from: '2025-01-01',
      to: '2025-01-31',
    });

    expect(tile('Novos cadastros')).toHaveTextContent('0Nenhum cadastro no período.');
  });

  it('sem o credenciamento, o 4º card é "Novos vendedores" com o atalho para a lista', () => {
    renderKpis(summaryOf());

    expect(tile('Novos vendedores')).toHaveTextContent('148 no período');
    expect(screen.getByRole('link', { name: 'Ver lista' })).toHaveAttribute(
      'href',
      '#vendedores-recentes',
    );
  });

  it('R4 (CCD094): com o credenciamento, o 4º card mostra pendentes, aprovados e conversão', async () => {
    const onAnalyzeQueue = vi.fn();
    renderKpis(summaryOf(), undefined, {
      summary: { approved: 0, pending: 1, conversionRate: 0 },
      onAnalyzeQueue,
    });

    const card = tile('Lojistas & Credenciamento');
    expect(card).toHaveTextContent('0 aprovados');
    expect(card).toHaveTextContent('1 Pendente');
    expect(card).toHaveTextContent('Conversão de 0% (aprovados ÷ analisados).');
    expect(screen.queryByRole('region', { name: 'Novos vendedores' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Analisar Fila' }));
    expect(onAnalyzeQueue).toHaveBeenCalledOnce();
  });
});
