import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardKpis as Kpis, MonthlySignups } from '../../dashboard.types';
import { DashboardKpis } from './DashboardKpis';

const kpis: Kpis = { totalUsers: 9, totalCards: 12, newUsers: 3, newSellers: 2 };
const signups: MonthlySignups[] = [
  { month: '2026-10', customers: 1, sellers: 0 },
  { month: '2026-11', customers: 0, sellers: 2 },
];

describe('DashboardKpis', () => {
  it('divide as cartas pelos usuários, arredondando', () => {
    render(<DashboardKpis kpis={kpis} signups={signups} />);

    expect(screen.getByRole('region', { name: 'Cartas cadastradas' })).toHaveTextContent(
      'Cartas por usuário1',
    );
  });

  it('mostra "—" em cartas por usuário quando não há usuários', () => {
    render(<DashboardKpis kpis={{ ...kpis, totalUsers: 0 }} signups={signups} />);

    expect(screen.getByRole('region', { name: 'Cartas cadastradas' })).toHaveTextContent(
      'Cartas por usuário—',
    );
  });

  it('mostra média e mês atual zerados quando o período não tem meses', () => {
    render(<DashboardKpis kpis={kpis} signups={[]} />);

    expect(screen.getByRole('region', { name: 'Novos cadastros' })).toHaveTextContent(
      'Média mensal0',
    );
    expect(screen.getByRole('region', { name: 'Novos cadastros' })).toHaveTextContent('Mês atual0');
  });

  it('sem o credenciamento, o 4º card é "Novos vendedores" com o atalho para a lista', () => {
    render(<DashboardKpis kpis={kpis} signups={signups} />);

    const card = screen.getByRole('region', { name: 'Novos vendedores' });
    expect(card).toHaveTextContent('2 no período');
    expect(screen.getByRole('link', { name: 'Ver lista' })).toHaveAttribute(
      'href',
      '#vendedores-recentes',
    );
  });

  it('R4: com o credenciamento, o 4º card mostra pendentes, aprovados e conversão', async () => {
    const onAnalyzeQueue = vi.fn();
    render(
      <DashboardKpis
        kpis={kpis}
        signups={signups}
        credentialing={{
          summary: { approved: 0, pending: 1, conversionRate: 0 },
          onAnalyzeQueue,
        }}
      />,
    );

    const card = screen.getByRole('region', { name: 'Lojistas & Credenciamento' });
    expect(card).toHaveTextContent('0 aprovados');
    expect(card).toHaveTextContent('1 Pendente');
    expect(card).toHaveTextContent('Conversão de 0% (aprovados ÷ analisados).');
    expect(screen.queryByRole('region', { name: 'Novos vendedores' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Analisar Fila' }));
    expect(onAnalyzeQueue).toHaveBeenCalledOnce();
  });
});
