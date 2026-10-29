import { describe, expect, it } from 'vitest';

import { dashboardKeys } from './dashboard.queries';
import { toPeriodParams } from './dashboard.period';

describe('toPeriodParams', () => {
  it('envia o período nomeado como period', () => {
    expect(toPeriodParams({ preset: '7d' })).toEqual({ period: '7d' });
  });

  it('envia o intervalo cortando o dia pelo horário de Brasília', () => {
    expect(toPeriodParams({ from: '2026-10-01', to: '2026-10-15' })).toEqual({
      from: '2026-10-01T00:00:00-03:00',
      to: '2026-10-15T23:59:59-03:00',
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
