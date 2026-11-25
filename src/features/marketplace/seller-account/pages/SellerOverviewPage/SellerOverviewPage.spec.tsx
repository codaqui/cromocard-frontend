import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { sellerAccountApi } from '../../seller-account.api';
import type { StripeAccount } from '../../seller-account.types';
import { SellerOverviewPage } from './SellerOverviewPage';

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const assign = vi.fn();

function renderPage(account: StripeAccount) {
  vi.mocked(sellerAccountApi.get).mockResolvedValue(account);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SellerOverviewPage />
    </QueryClientProvider>,
  );
}

const createListing = () => screen.findByRole('button', { name: /Criar Novo Anúncio/ });

describe('SellerOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { ...window.location, assign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('CA1 e CA2: sem conta, mostra o aviso e leva ao cadastro na Stripe', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockResolvedValue({
      url: 'https://connect.stripe.com/setup/e/acct_1',
    });
    renderPage({ status: 'NOT_CONNECTED', pendingReason: null });

    expect(
      await screen.findByRole('heading', { name: 'Conecte sua conta de recebimento para vender' }),
    ).toBeInTheDocument();
    expect(await createListing()).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Conectar conta Stripe' }));

    expect(assign).toHaveBeenCalledWith('https://connect.stripe.com/setup/e/acct_1');
  });

  it('CA9: com a Stripe fora do ar, avisa o erro e deixa tentar de novo', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockRejectedValue(
      new ApiError({ status: 502, code: 'PAYMENT_PROVIDER_ERROR', message: 'Stripe fora do ar' }),
    );
    renderPage({ status: 'PENDING', pendingReason: 'NOT_SUBMITTED' });

    await userEvent.click(await screen.findByRole('button', { name: 'Continuar cadastro' }));

    expect(
      await screen.findByText(/Não foi possível abrir o cadastro na Stripe/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar cadastro' })).toBeEnabled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('CA9: o botão mostra o carregamento enquanto espera a Stripe', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockReturnValue(new Promise(() => undefined));
    renderPage({ status: 'NOT_CONNECTED', pendingReason: null });

    await userEvent.click(await screen.findByRole('button', { name: 'Conectar conta Stripe' }));

    expect(await screen.findByRole('button', { name: 'Abrindo a Stripe…' })).toBeDisabled();
  });

  it('CA7: com pedido de informação, oferece completar o cadastro e mantém o anúncio bloqueado', async () => {
    renderPage({ status: 'PENDING', pendingReason: 'MORE_INFO_REQUIRED' });

    expect(await screen.findByRole('button', { name: 'Completar cadastro' })).toBeInTheDocument();
    expect(await createListing()).toHaveAttribute(
      'title',
      'Conecte sua conta de recebimento para publicar anúncios',
    );
  });

  it('CA3: em verificação, mostra o selo Verificando', async () => {
    renderPage({ status: 'VERIFYING', pendingReason: null });

    expect(
      await screen.findByRole('heading', { name: 'Estamos verificando sua conta na Stripe' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Verificando')).toBeInTheDocument();
    expect(await createListing()).toBeDisabled();
  });

  it('CA4: conta pronta tira o aviso e libera Criar Novo Anúncio', async () => {
    renderPage({ status: 'READY', pendingReason: null });

    expect(await createListing()).toBeEnabled();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('avisa quando não consegue carregar a conta', async () => {
    vi.mocked(sellerAccountApi.get).mockRejectedValue(new Error('rede'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <SellerOverviewPage />
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText('Não foi possível carregar a sua conta de recebimento.'),
    ).toBeInTheDocument();
  });
});
