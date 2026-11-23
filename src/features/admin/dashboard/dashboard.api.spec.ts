import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardApi } from './dashboard.api';

const http = vi.hoisted(() => ({
  getPage: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/http', () => ({ api: http }));

describe('dashboardApi', () => {
  beforeEach(() => {
    http.getPage.mockClear();
    http.get.mockClear();
  });

  it('busca o resumo do período', async () => {
    await dashboardApi.getSummary({ period: '30d' });

    expect(http.get).toHaveBeenCalledWith('/admin/dashboard', { period: '30d' });
  });

  it('busca a evolução de cadastros do período', async () => {
    const params = { from: '2026-10-01T03:00:00.000Z', to: '2026-11-01T02:59:59.999Z' };

    await dashboardApi.getSignupsEvolution(params);

    expect(http.get).toHaveBeenCalledWith('/admin/dashboard/signups-evolution', params);
  });
});
