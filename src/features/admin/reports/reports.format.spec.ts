import { describe, expect, it } from 'vitest';

import { formatReportCell, reportFileName } from './reports.format';

describe('reports.format', () => {
  it('mostra datas no fuso de Brasília e traduz papéis e tipos', () => {
    expect(formatReportCell('2026-11-16T02:00:00.000Z')).toBe('15/11/2026');
    expect(formatReportCell('SELLER')).toBe('Vendedor');
    expect(formatReportCell('ALBUM')).toBe('Álbum');
    expect(formatReportCell('Pikachu')).toBe('Pikachu');
  });

  it('mostra um traço quando a célula está vazia', () => {
    expect(formatReportCell(null)).toBe('—');
    expect(formatReportCell(undefined)).toBe('—');
  });

  it('monta o mesmo nome de arquivo que a API', () => {
    const period = { from: '2026-10-18T03:00:00.000Z', to: '2026-11-16T15:00:00.000Z' };

    expect(reportFileName('signups', period, 'csv')).toBe(
      'cromocard-signups-2026-10-18-2026-11-16.csv',
    );
  });
});
