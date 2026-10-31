import { describe, expect, it } from 'vitest';

import { dashboardKeys } from './dashboard.queries';
import { toPeriodParams } from './dashboard.period';

describe('toPeriodParams', () => {
  it('envia o período nomeado como period', () => {
    expect(toPeriodParams({ preset: '7d' })).toEqual({ period: '7d' });
  });

  it('envia o intervalo em UTC, cortando o dia pelo horário de Brasília', () => {
    expect(toPeriodParams({ from: '2026-10-01', to: '2026-10-15' })).toEqual({
      from: '2026-10-01T03:00:00.000Z',
      to: '2026-10-16T02:59:59.999Z',
    });
  });

  it('respeita o horário de verão antigo de Brasília', () => {
    expect(toPeriodParams({ from: '2001-01-10', to: '2001-01-10' })).toEqual({
      from: '2001-01-10T02:00:00.000Z',
      to: '2001-01-11T01:59:59.999Z',
    });
  });
});

describe('dashboardKeys', () => {
  it('muda a chave da consulta quando o período muda', () => {
    expect(dashboardKeys.summary({ period: '7d' })).not.toEqual(
      dashboardKeys.summary({ period: '30d' }),
    );
  });
});
