import { describe, expect, it } from 'vitest';

import { formatCount, formatPeriodRange, monthName } from './dashboard.format';

describe('dashboard.format', () => {
  it('mostra o intervalo no horário de Brasília, com o ano no fim', () => {
    expect(formatPeriodRange('2026-10-01T03:00:00.000Z', '2026-10-31T02:59:59.999Z')).toBe(
      '01 Out - 30 Out, 2026',
    );
  });

  it('mostra o ano do início quando o intervalo vira o ano', () => {
    expect(formatPeriodRange('2025-10-31T03:00:00.000Z', '2026-10-30T15:00:00.000Z')).toBe(
      '31 Out, 2025 - 30 Out, 2026',
    );
  });

  it('formata contagens e o total de cartas ainda sem catálogo', () => {
    expect(formatCount(48920)).toBe('48.920');
    expect(formatCount(null)).toBe('—');
  });

  it('dá o nome do mês', () => {
    expect(monthName('2026-11')).toBe('novembro');
  });
});
