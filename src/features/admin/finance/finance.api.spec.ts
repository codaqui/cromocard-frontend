import { beforeEach, describe, expect, it, vi } from 'vitest';

import { financeApi } from './finance.api';

const http = vi.hoisted(() => ({
  getPage: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/http', () => ({ api: http }));

describe('financeApi', () => {
  beforeEach(() => {
    http.getPage.mockClear();
    http.get.mockClear();
  });

  it('busca o resumo financeiro do período', async () => {
    await financeApi.getSummary({ period: '30d' });

    expect(http.get).toHaveBeenCalledWith('/admin/finance/summary', { period: '30d' });
  });

  it('busca o livro razão do dia, com 10 linhas por padrão', async () => {
    await financeApi.getLedger({ date: '2026-11-18' });

    expect(http.getPage).toHaveBeenCalledWith('/admin/finance/ledger', {
      date: '2026-11-18',
      pageSize: 10,
    });
  });

  it('manda os ids separados por vírgula nas listas', async () => {
    await financeApi.getSellerStats(['a', 'b']);
    await financeApi.getCardStats(['c']);
    await financeApi.getGroupStats(['d', 'e']);

    expect(http.get).toHaveBeenNthCalledWith(1, '/admin/finance/sellers', { ids: 'a,b' });
    expect(http.get).toHaveBeenNthCalledWith(2, '/admin/finance/cards', { ids: 'c' });
    expect(http.get).toHaveBeenNthCalledWith(3, '/admin/finance/groups', { ids: 'd,e' });
  });
});
