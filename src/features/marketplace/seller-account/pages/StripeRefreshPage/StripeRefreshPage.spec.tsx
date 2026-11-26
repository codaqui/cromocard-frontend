import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { sellerAccountApi } from '../../seller-account.api';
import { SellerOverviewPage } from '../SellerOverviewPage/SellerOverviewPage';
import { StripeRefreshPage } from './StripeRefreshPage';

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const replace = vi.fn();
const routes = [
  { path: paths.seller.stripeRefresh, element: <StripeRefreshPage /> },
  { path: paths.seller.overview, element: <SellerOverviewPage /> },
];

describe('StripeRefreshPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { ...window.location, replace });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CA6: link vencido gera um só link novo da mesma conta e redireciona', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockResolvedValue({
      url: 'https://connect.stripe.com/setup/e/acct_1',
    });
    renderWithProviders({ routes, initialPath: paths.seller.stripeRefresh, strict: true });

    expect(screen.getByText('Abrindo de novo o cadastro na Stripe…')).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith('https://connect.stripe.com/setup/e/acct_1'),
    );
    expect(sellerAccountApi.createOnboardingLink).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('CA9: com a Stripe fora do ar, volta à Visão geral com a mensagem de erro', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockRejectedValue(
      new Error('Stripe fora do ar'),
    );
    vi.mocked(sellerAccountApi.get).mockResolvedValue({
      status: 'PENDING',
      pendingReason: 'NOT_SUBMITTED',
    });
    renderWithProviders({ routes, initialPath: paths.seller.stripeRefresh });

    expect(
      await screen.findByText(/Não foi possível abrir o cadastro na Stripe/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar cadastro' })).toBeEnabled();
  });
});
