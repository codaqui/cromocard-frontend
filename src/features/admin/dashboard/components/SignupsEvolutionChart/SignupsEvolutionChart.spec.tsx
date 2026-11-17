import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import type { EvolutionBucket, EvolutionPoint, SignupsEvolution } from '../../dashboard.types';
import { SignupsEvolutionChart } from './SignupsEvolutionChart';

const NOW = new Date('2026-11-11T16:00:00Z');

function evolutionOf(bucket: EvolutionBucket, points: EvolutionPoint[]): SignupsEvolution {
  const totals = points.reduce(
    (sum, point) => ({
      collectors: sum.collectors + point.collectors,
      sellers: sum.sellers + point.sellers,
    }),
    { collectors: 0, sellers: 0 },
  );
  return { period: { from: points[0]?.at ?? '', to: NOW.toISOString() }, bucket, points, totals };
}

const days = (from: number, counts: [number, number][]): EvolutionPoint[] =>
  counts.map(([collectors, sellers], index) => ({
    at: new Date(Date.UTC(2026, 10, from + index, 3)).toISOString(),
    collectors,
    sellers,
  }));

const hours = (count: number): EvolutionPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    at: new Date(Date.UTC(2026, 10, 11, 3 + index)).toISOString(),
    collectors: index,
    sellers: index % 2,
  }));

function renderChart(evolution: SignupsEvolution, period: Period) {
  render(<SignupsEvolutionChart evolution={evolution} period={period} now={NOW} />);
}

const week = days(5, [
  [150, 3],
  [180, 5],
  [120, 4],
  [160, 6],
  [140, 5],
  [212, 8],
  [122, 5],
]);

describe('SignupsEvolutionChart', () => {
  it('CA1: em 7 dias, mostra um ponto por dia com o dia da semana e o total de cada linha', () => {
    renderChart(evolutionOf('day', week), { preset: '7d' });

    expect(
      screen.getByRole('heading', { name: 'Evolução: Novos Cadastros vs Lojistas Certificados' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Novos cadastros por dia nos últimos 7 dias.')).toBeInTheDocument();
    expect(screen.getByText('Colecionadores (+1.084)')).toBeInTheDocument();
    expect(screen.getByText('Lojistas (+36)')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.getByText('Qui (05/11)')).toBeInTheDocument();
    expect(screen.getByText('Qua (Hoje)')).toBeInTheDocument();
  });

  it('R5: passar o cursor mostra o valor do ponto', async () => {
    renderChart(evolutionOf('day', week), { preset: '7d' });

    await userEvent.hover(
      screen.getByRole('button', {
        name: 'Ter (10/11): 212 novos cadastros e 8 lojistas certificados',
      }),
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('Ter (10/11)');
    expect(tooltip).toHaveTextContent('212 novos cadastros');
    expect(tooltip).toHaveTextContent('8 lojistas certificados');

    await userEvent.unhover(screen.getByRole('button', { name: /^Ter \(10\/11\)/ }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('R5: o valor também aparece pelo teclado, no singular quando é um', async () => {
    renderChart(evolutionOf('day', days(10, [[1, 1]])), { preset: 'today' });

    await userEvent.tab();

    expect(screen.getByRole('tooltip')).toHaveTextContent('1 novo cadastro1 lojista certificado');
  });

  it('CA2: no período de hoje, os pontos são por hora até agora', () => {
    renderChart(evolutionOf('hour', hours(14)), { preset: 'today' });

    expect(screen.getByText('Novos cadastros por hora hoje.')).toBeInTheDocument();
    expect(screen.getByText('00h')).toBeInTheDocument();
    expect(screen.getByText('Agora (13h)')).toBeInTheDocument();
  });

  it('R4: em 30 dias, mostra as datas espaçadas e marca hoje', () => {
    const month = days(
      -18,
      Array.from({ length: 30 }, (): [number, number] => [100, 4]),
    );

    renderChart(evolutionOf('day', month), { preset: '30d' });

    expect(screen.getByText('Novos cadastros por dia nos últimos 30 dias.')).toBeInTheDocument();
    expect(screen.getByText('13/10')).toBeInTheDocument();
    expect(screen.getByText('11/11 (Hoje)')).toBeInTheDocument();
  });

  it('R4: em 1 ano, os pontos são por mês e o mês atual aparece marcado', () => {
    const year = [
      { at: '2026-10-01T03:00:00.000Z', collectors: 30, sellers: 2 },
      { at: '2026-11-01T03:00:00.000Z', collectors: 12, sellers: 1 },
    ];

    renderChart(evolutionOf('month', year), { preset: '1y' });

    expect(screen.getByText('Novos cadastros por mês nos últimos 12 meses.')).toBeInTheDocument();
    expect(screen.getByText('Out/26')).toBeInTheDocument();
    expect(screen.getByText('Nov/26 (atual)')).toBeInTheDocument();
  });

  it('agrupa um intervalo personalizado como a API devolveu, sem marcar hoje', () => {
    const past = days(1, [
      [3, 0],
      [5, 1],
    ]).map((point) => ({ ...point, at: point.at.replace('2026', '2025') }));

    renderChart(evolutionOf('day', past), { from: '2025-11-01', to: '2025-11-02' });

    expect(screen.getByText('Novos cadastros por dia no período selecionado.')).toBeInTheDocument();
    expect(screen.getByText('Dom (02/11)')).toBeInTheDocument();
  });

  it('CA5: sem cadastros no período, mostra a mensagem no lugar do gráfico', () => {
    renderChart(
      evolutionOf(
        'day',
        days(1, [
          [0, 0],
          [0, 0],
        ]),
      ),
      { from: '2025-01-01', to: '2025-01-31' },
    );

    expect(screen.getByText('Não há cadastros no período.')).toBeInTheDocument();
    expect(screen.getByText('Colecionadores (+0)')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
