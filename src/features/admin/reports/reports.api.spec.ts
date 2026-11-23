import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EXPORTS_PAGE_SIZE, PREVIEW_SIZE, reportsApi } from './reports.api';

const http = vi.hoisted(() => ({
  getWithMeta: vi.fn(),
  getBlob: vi.fn(),
  getPage: vi.fn(),
}));

vi.mock('@/lib/http', () => ({ api: http }));

describe('reportsApi', () => {
  beforeEach(() => {
    http.getWithMeta.mockReset();
    http.getBlob.mockReset();
    http.getPage.mockReset();
  });

  it('CCD107: lista o histórico de exportações da página pedida', async () => {
    await reportsApi.listExports({ page: 2, pageSize: EXPORTS_PAGE_SIZE });

    expect(http.getPage).toHaveBeenCalledWith('/admin/reports/exports', { page: 2, pageSize: 10 });
  });

  it('CCD107: baixa de novo o arquivo de uma exportação', async () => {
    await reportsApi.downloadExport('0198f0c2-7a3b-7c1d-8e2f-1a2b3c4d9482');

    expect(http.getBlob).toHaveBeenCalledWith(
      '/admin/reports/exports/0198f0c2-7a3b-7c1d-8e2f-1a2b3c4d9482/file',
    );
  });

  it('CA1: busca a prévia com as primeiras linhas e junta o total do meta', async () => {
    const data = {
      type: 'signups',
      title: 'Novos cadastros',
      period: { from: '2026-10-18T03:00:00.000Z', to: '2026-11-16T15:00:00.000Z' },
      columns: [{ key: 'name', label: 'Nome' }],
      rows: [{ name: 'Ana Lima' }],
    };
    http.getWithMeta.mockResolvedValue({ data, meta: { total: 4218 } });

    const preview = await reportsApi.preview('signups', { period: '30d' });

    expect(http.getWithMeta).toHaveBeenCalledWith('/admin/reports/signups', {
      period: '30d',
      pageSize: PREVIEW_SIZE,
    });
    expect(preview).toEqual({ ...data, total: 4218 });
  });

  it('CA2: baixa o arquivo no formato escolhido, com o mesmo período', async () => {
    const file = new Blob(['Nome;E-mail']);
    http.getBlob.mockResolvedValue(file);
    const range = { from: '2026-11-01T03:00:00.000Z', to: '2026-11-16T02:59:59.999Z' };

    await expect(reportsApi.export('catalog', 'pdf', range)).resolves.toBe(file);
    expect(http.getBlob).toHaveBeenCalledWith('/admin/reports/catalog/export', {
      ...range,
      format: 'pdf',
    });
  });
});
