import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sellerAccountApi } from './seller-account.api';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

describe('sellerAccountApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lê o estado da conta de recebimento do vendedor', async () => {
    await sellerAccountApi.get();

    expect(api.get).toHaveBeenCalledWith('/me/stripe-account');
  });

  it('pede o link de cadastro e consulta a conta na volta da Stripe', async () => {
    await sellerAccountApi.createOnboardingLink();
    await sellerAccountApi.refresh();

    expect(api.post).toHaveBeenNthCalledWith(1, '/me/stripe-account/onboarding-link');
    expect(api.post).toHaveBeenNthCalledWith(2, '/me/stripe-account/refresh');
  });
});
