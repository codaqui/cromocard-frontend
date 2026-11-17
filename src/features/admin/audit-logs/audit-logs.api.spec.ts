import { beforeEach, describe, expect, it, vi } from 'vitest';

import { auditLogsApi } from './audit-logs.api';

const http = vi.hoisted(() => ({
  getPage: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/http', () => ({ api: http }));

describe('auditLogsApi', () => {
  beforeEach(() => {
    http.getPage.mockClear();
    http.get.mockClear();
  });

  it('lista os registros com os filtros como parâmetros', async () => {
    const params = { page: 2, pageSize: 10, action: 'GROUP_DELETED' as const };

    await auditLogsApi.list(params);

    expect(http.getPage).toHaveBeenCalledWith('/admin/audit-logs', params);
  });

  it('busca o detalhe de um registro pelo id', async () => {
    await auditLogsApi.getById('log-2');

    expect(http.get).toHaveBeenCalledWith('/admin/audit-logs/log-2');
  });
});
