import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { sellerAccountApi } from '../../seller-account.api';
import { StripeReturnPage } from './StripeReturnPage';

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const routes = [
  { path: paths.seller.stripeReturn, element: <StripeReturnPage /> },
  { path: paths.seller.overview, element: <h1>Visão geral</h1> },
];

describe('StripeReturnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA3: na volta da Stripe, consulta a conta e leva à Visão geral', async () => {
    vi.mocked(sellerAccountApi.refresh).mockResolvedValue({
      status: 'VERIFYING',
      pendingReason: null,
    });
    renderWithProviders({ routes, initialPath: paths.seller.stripeReturn });

    expect(screen.getByText('Conferindo o seu cadastro na Stripe…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
    expect(sellerAccountApi.refresh).toHaveBeenCalledTimes(1);
  });

  it('com a Stripe fora do ar, volta à Visão geral, que mostra o estado gravado', async () => {
    vi.mocked(sellerAccountApi.refresh).mockRejectedValue(new Error('Stripe fora do ar'));
    renderWithProviders({ routes, initialPath: paths.seller.stripeReturn });

    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
  });
});
