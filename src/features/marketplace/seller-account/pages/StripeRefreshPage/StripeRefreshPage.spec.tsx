import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { sellerAccountApi } from '../../seller-account.api';
import { StripeRefreshPage } from './StripeRefreshPage';

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const replace = vi.fn();
const routes = [
  { path: paths.seller.stripeRefresh, element: <StripeRefreshPage /> },
  { path: paths.seller.overview, element: <h1>Visão geral</h1> },
];

describe('StripeRefreshPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { ...window.location, replace });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CA6: link vencido gera outro link de cadastro da mesma conta e redireciona', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockResolvedValue({
      url: 'https://connect.stripe.com/setup/e/acct_1',
    });
    renderWithProviders({ routes, initialPath: paths.seller.stripeRefresh });

    expect(screen.getByText('Abrindo de novo o cadastro na Stripe…')).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith('https://connect.stripe.com/setup/e/acct_1'),
    );
    expect(sellerAccountApi.createOnboardingLink).toHaveBeenCalledTimes(1);
  });

  it('com a Stripe fora do ar, volta à Visão geral', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockRejectedValue(
      new Error('Stripe fora do ar'),
    );
    renderWithProviders({ routes, initialPath: paths.seller.stripeRefresh });

    expect(await screen.findByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
  });
});
