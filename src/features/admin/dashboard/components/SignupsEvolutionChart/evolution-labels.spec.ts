import { describe, expect, it } from 'vitest';

import type { EvolutionPoint } from '../../dashboard.types';
import { axisLabels } from './evolution-labels';

const NOW = new Date('2026-11-11T16:00:00Z');

const daysUntilToday = (count: number): EvolutionPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    at: new Date(Date.UTC(2026, 10, 12 - count + index, 3)).toISOString(),
    collectors: 1,
    sellers: 0,
  }));

describe('axisLabels', () => {
  it('R4: em 7 dias, o dia atual vem destacado em caixa, como no Figma', () => {
    const labels = axisLabels(daysUntilToday(7), 'day', NOW);

    expect(labels.at(-1)).toMatchObject({ text: 'Qua (Hoje)', current: true, boxed: true });
    expect(labels.filter(({ boxed }) => boxed)).toHaveLength(1);
  });

  it('R4: em 30 dias, hoje aparece em maiúsculas e sem caixa', () => {
    const labels = axisLabels(daysUntilToday(30), 'day', NOW);

    expect(labels.at(-1)).toMatchObject({ text: '11/11 (HOJE)', current: true, boxed: false });
  });
});

describe('axisLabels: espaço entre os rótulos', () => {
  it('R4: o penúltimo rótulo sai quando ficaria perto demais do último', () => {
    const labels = axisLabels(daysUntilToday(30), 'day', NOW).map(({ text }) => text);

    expect(labels).toEqual(['13/10', '18/10', '23/10', '28/10', '02/11', '11/11 (HOJE)']);
  });

  it('R4: em 1 ano, mostra no máximo 5 meses para caber o mês atual', () => {
    const months = Array.from({ length: 13 }, (_, index) => ({
      at: new Date(Date.UTC(2025, 10 + index, 1, 3)).toISOString(),
      collectors: 1,
      sellers: 0,
    }));

    const labels = axisLabels(months, 'month', NOW).map(({ text }) => text);

    expect(labels).toEqual(['Nov/25', 'Fev/26', 'Mai/26', 'Ago/26', 'Nov/26 (atual)']);
  });
});

describe('axisLabels: sem pontos', () => {
  it('não monta rótulos quando o período não tem pontos', () => {
    expect(axisLabels([], 'day', NOW)).toEqual([]);
  });
});
