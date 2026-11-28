import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { cardProfileApi } from './card-profile.api';

vi.mock('@/lib/http', () => ({ api: { get: vi.fn() } }));

describe('cardProfileApi', () => {
  it('busca o perfil público pelo id da carta', async () => {
    vi.mocked(api).get.mockResolvedValue({ id: 'c1' });

    await expect(cardProfileApi.get('c1')).resolves.toEqual({ id: 'c1' });
    expect(vi.mocked(api).get.mock.calls[0]).toEqual(['/cards/c1']);
  });
});
