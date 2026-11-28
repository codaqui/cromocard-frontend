import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { sellerAccountApi } from '../../seller-account.api';
import { SellerOverviewPage } from '../SellerOverviewPage/SellerOverviewPage';
import { StripeReturnPage } from './StripeReturnPage';

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const routes = [
  { path: paths.seller.stripeReturn, element: <StripeReturnPage /> },
  { path: paths.seller.overview, element: <SellerOverviewPage /> },
];

describe('StripeReturnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA3: na volta da Stripe, consulta a conta e a Visão geral já abre com o estado novo', async () => {
    vi.mocked(sellerAccountApi.refresh).mockResolvedValue({
      status: 'VERIFYING',
      pendingReason: null,
    });
    // A consulta da Visão geral nunca responde: o estado novo só pode vir da volta (setQueryData).
    vi.mocked(sellerAccountApi.get).mockReturnValue(new Promise(() => undefined));
    renderWithProviders({ routes, initialPath: paths.seller.stripeReturn, strict: true });

    expect(screen.getByText('Conferindo o seu cadastro na Stripe…')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Estamos verificando sua conta na Stripe' }),
    ).toBeInTheDocument();
    expect(sellerAccountApi.refresh).toHaveBeenCalledTimes(1);
  });

  it('com a Stripe fora do ar, volta à Visão geral, que mostra o estado gravado', async () => {
    vi.mocked(sellerAccountApi.refresh).mockRejectedValue(new Error('Stripe fora do ar'));
    vi.mocked(sellerAccountApi.get).mockResolvedValue({
      status: 'NOT_CONNECTED',
      pendingReason: null,
    });
    renderWithProviders({ routes, initialPath: paths.seller.stripeReturn });

    expect(
      await screen.findByRole('heading', { name: 'Conecte sua conta de recebimento para vender' }),
    ).toBeInTheDocument();
  });
});
