import { describe, expect, it } from 'vitest';

import { monthGrid, monthLabel, monthOf, shiftMonth } from './calendar-days';

describe('calendar-days', () => {
  it('monta novembro de 2026 de domingo a sábado, com os dias de dezembro no fim', () => {
    const weeks = monthGrid('2026-11');

    expect(weeks).toHaveLength(5);
    expect(weeks[0]?.map(({ day }) => day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(weeks[4]?.map(({ day, inMonth }) => [day, inMonth])).toEqual([
      [29, true],
      [30, true],
      [1, false],
      [2, false],
      [3, false],
      [4, false],
      [5, false],
    ]);
  });

  it('completa o começo com os dias do mês anterior', () => {
    const [firstWeek] = monthGrid('2026-12');

    expect(firstWeek?.[0]).toEqual({ iso: '2026-11-29', day: 29, inMonth: false });
    expect(firstWeek?.[2]).toEqual({ iso: '2026-12-01', day: 1, inMonth: true });
  });

  it('navega entre meses e escreve o nome do mês', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(monthOf('2026-11-13')).toBe('2026-11');
    expect(monthLabel('2026-11')).toBe('Novembro 2026');
  });
});
