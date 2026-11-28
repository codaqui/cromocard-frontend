import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { listingsApi } from './listings.api';

vi.mock('@/lib/http', () => ({ api: { get: vi.fn(), getPage: vi.fn(), post: vi.fn() } }));

const input = {
  cardId: 'card-1',
  conditionId: 'condition-1',
  price: '1850.00',
  availableQuantity: 1,
  description: undefined,
  photoUrls: [],
};

const calls = (method: 'get' | 'getPage' | 'post') => vi.mocked(api)[method].mock.calls;

describe('listingsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consulta a elegibilidade e cria o anúncio do vendedor logado', () => {
    void listingsApi.getEligibility();
    void listingsApi.create(input);

    expect(calls('get')).toContainEqual(['/me/listings/eligibility']);
    expect(calls('post')).toContainEqual(['/me/listings', input]);
  });

  it('busca as cartas do catálogo e as condições', () => {
    void listingsApi.searchCards('char');
    void listingsApi.listConditions();

    expect(calls('getPage')).toContainEqual(['/cards', { q: 'char', pageSize: 10 }]);
    expect(calls('get')).toContainEqual(['/card-conditions']);
  });

  it('envia a foto para a pasta listings', () => {
    const file = new File(['x'], 'frente.png', { type: 'image/png' });

    void listingsApi.uploadPhoto(file);

    const [path, form] = calls('post')[0] ?? [];
    expect(path).toBe('/uploads');
    expect((form as FormData).get('folder')).toBe('listings');
    expect((form as FormData).get('file')).toBe(file);
  });
});
