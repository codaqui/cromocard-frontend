import { describe, expect, it } from 'vitest';

import {
  exportCode,
  exportParamsOf,
  exportPeriodLabel,
  formatAvailableUntil,
  formatExportedAt,
  formatFileSize,
  reportTitle,
  requesterLabel,
} from './reports.history';
import type { ReportExport } from './reports.types';

const item: ReportExport = {
  id: '0198f0c2-7a3b-7c1d-8e2f-1a2b3c4dab82',
  type: 'signups',
  format: 'pdf',
  fileSize: 5_033_165,
  filters: { period: '30d', from: '2026-10-19T03:00:00.000Z', to: '2026-11-18T15:00:00.000Z' },
  requestedBy: { name: 'Marcos Admin', username: 'marcos_admin' },
  createdAt: '2026-11-18T17:38:00.000Z',
  expiresAt: '2027-02-16T17:38:00.000Z',
  expired: false,
};

const range = { period: null, from: '2026-10-01T03:00:00.000Z', to: '2026-11-12T02:59:59.999Z' };

describe('reports.history', () => {
  it('L6: o código usa os 4 últimos caracteres do id, em maiúsculas', () => {
    expect(exportCode(item.id)).toBe('#REP-AB82');
  });

  it('mostra o relatório e o período pronto ou o intervalo de datas', () => {
    expect(reportTitle('catalog')).toBe('Catálogo');
    expect(exportPeriodLabel(item)).toBe('Últimos 30 dias');
    expect(exportPeriodLabel({ ...item, filters: range })).toBe('01/10/2026 a 11/11/2026');
  });

  it('mostra hoje, ontem ou a data, com a hora de Brasília', () => {
    const now = new Date('2026-11-18T20:00:00.000Z');

    expect(formatExportedAt(item.createdAt, now)).toBe('Hoje · 14:38');
    expect(formatExportedAt('2026-11-17T21:42:00.000Z', now)).toBe('Ontem · 18:42');
    expect(formatExportedAt('2026-08-05T12:20:00.000Z', now)).toBe('05/08/2026 · 09:20');
  });

  it('mostra o tamanho em B, KB ou MB', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(item.fileSize)).toBe('4,8 MB');
    expect(formatFileSize(null)).toBe('—');
  });

  it('mostra a data até quando o arquivo fica disponível', () => {
    expect(formatAvailableUntil(item.expiresAt)).toBe('16/02/2027');
  });

  it('gera de novo com os mesmos filtros da exportação', () => {
    expect(exportParamsOf(item)).toEqual({ period: '30d' });
    expect(exportParamsOf({ ...item, filters: range })).toEqual({
      from: range.from,
      to: range.to,
    });
  });

  it('mostra o @usuário do solicitante ou o nome quando não há usuário', () => {
    expect(requesterLabel(item)).toBe('@marcos_admin');
    expect(requesterLabel({ ...item, requestedBy: { name: 'Fernanda', username: null } })).toBe(
      'Fernanda',
    );
  });
});
