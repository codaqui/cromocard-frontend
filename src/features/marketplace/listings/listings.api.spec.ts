import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { listingsApi } from './listings.api';

vi.mock('@/lib/http', () => ({ api: { getPage: vi.fn() } }));

describe('listingsApi', () => {
  it('pede os anúncios da carta pelo menor preço, com a página', async () => {
    const page = { data: [], meta: { page: 2, pageSize: 20, total: 0, totalPages: 0 } };
    vi.mocked(api).getPage.mockResolvedValue(page);

    await expect(listingsApi.listByCard('c1', { page: 2, pageSize: 20 })).resolves.toBe(page);
    expect(vi.mocked(api).getPage.mock.calls[0]).toEqual([
      '/cards/c1/listings',
      {
        page: 2,
        pageSize: 20,
        sort: 'price',
      },
    ]);
  });
});
