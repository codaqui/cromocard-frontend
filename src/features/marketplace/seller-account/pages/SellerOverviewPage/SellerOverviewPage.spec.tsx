import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { sellerAccountApi } from '../../seller-account.api';
import type { StripeAccount } from '../../seller-account.types';
import { SellerOverviewPage } from './SellerOverviewPage';

const getEligibility = vi.hoisted(() => vi.fn());

vi.mock('../../seller-account.api', () => ({
  sellerAccountApi: { get: vi.fn(), createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

vi.mock('@/features/marketplace/listings/listings.api', () => ({
  listingsApi: {
    getEligibility,
    listConditions: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    searchCards: vi.fn(),
    uploadPhoto: vi.fn(),
  },
}));

const assign = vi.fn();
const CONNECT_HELP =
  'O cadastro é feito na própria Stripe e leva poucos minutos. Sem a conta pronta, não é possível publicar anúncios.';

const routes = [
  { path: paths.seller.overview, element: <SellerOverviewPage /> },
  { path: paths.seller.store, element: <h1>Loja pública</h1> },
];

function renderPage(account?: StripeAccount) {
  if (account) vi.mocked(sellerAccountApi.get).mockResolvedValue(account);
  return renderWithProviders({ routes, initialPath: paths.seller.overview });
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

  it('CA9: com a Stripe fora do ar, avisa o erro, deixa tentar de novo e fecha o aviso', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(
      screen.queryByText(/Não foi possível abrir o cadastro na Stripe/),
    ).not.toBeInTheDocument();
  });

  it('CA9: link de cadastro fora da Stripe não sai do app e vira o mesmo erro', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockResolvedValue({
      url: 'https://golpe.example.com/setup',
    });
    renderPage({ status: 'NOT_CONNECTED', pendingReason: null });

    await userEvent.click(await screen.findByRole('button', { name: 'Conectar conta Stripe' }));

    expect(
      await screen.findByText(/Não foi possível abrir o cadastro na Stripe/),
    ).toBeInTheDocument();
    expect(assign).not.toHaveBeenCalled();
  });

  it('CA9: o botão mostra o carregamento enquanto espera a Stripe', async () => {
    vi.mocked(sellerAccountApi.createOnboardingLink).mockReturnValue(new Promise(() => undefined));
    renderPage({ status: 'NOT_CONNECTED', pendingReason: null });

    await userEvent.click(await screen.findByRole('button', { name: 'Conectar conta Stripe' }));

    expect(await screen.findByRole('button', { name: 'Abrindo a Stripe…' })).toBeDisabled();
  });

  it('CA7: com pedido de informação, oferece completar o cadastro e explica o anúncio bloqueado', async () => {
    renderPage({ status: 'PENDING', pendingReason: 'MORE_INFO_REQUIRED' });

    expect(await screen.findByRole('button', { name: 'Completar cadastro' })).toBeInTheDocument();
    const button = await createListing();
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(CONNECT_HELP);
  });

  it('CA3: em verificação, mostra o selo Verificando', async () => {
    renderPage({ status: 'VERIFYING', pendingReason: null });

    expect(
      await screen.findByRole('heading', { name: 'Estamos verificando sua conta na Stripe' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Verificando')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Conectar|Continuar|Completar/ })).toBeNull();
    expect(await createListing()).toBeDisabled();
  });

  it('CA4: conta pronta tira o aviso e libera Criar Novo Anúncio', async () => {
    renderPage({ status: 'READY', pendingReason: null });

    const button = await createListing();
    expect(button).toBeEnabled();
    expect(button).not.toHaveAccessibleDescription();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('CCD084 T12: Criar Novo Anúncio abre o formulário de anúncio', async () => {
    getEligibility.mockResolvedValue({
      canCreate: true,
      stripeAccountReady: true,
      hasPrimaryAddress: true,
    });
    renderPage({ status: 'READY', pendingReason: null });

    await userEvent.click(await createListing());

    expect(await screen.findByRole('dialog', { name: 'Criar anúncio' })).toBeInTheDocument();
  });

  it('CCD084 CA7: se a conta deixou de estar pronta, o aviso leva ao cadastro na Stripe', async () => {
    getEligibility.mockResolvedValue({
      canCreate: false,
      stripeAccountReady: false,
      hasPrimaryAddress: true,
    });
    vi.mocked(sellerAccountApi.createOnboardingLink).mockResolvedValue({
      url: 'https://connect.stripe.com/setup/e/acct_1',
    });
    renderPage({ status: 'READY', pendingReason: null });

    await userEvent.click(await createListing());
    await userEvent.click(await screen.findByRole('button', { name: 'Conectar conta Stripe' }));

    await vi.waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://connect.stripe.com/setup/e/acct_1'),
    );
  });

  it('Ver Loja Pública leva à loja pública do vendedor (CCD080)', async () => {
    renderPage({ status: 'READY', pendingReason: null });

    await userEvent.click(await screen.findByRole('button', { name: 'Ver Loja Pública' }));

    expect(await screen.findByRole('heading', { name: 'Loja pública' })).toBeInTheDocument();
  });

  it('sem carregar a conta, mantém o cabeçalho e deixa tentar de novo', async () => {
    vi.mocked(sellerAccountApi.get)
      .mockRejectedValueOnce(new Error('rede'))
      .mockResolvedValueOnce({ status: 'READY', pendingReason: null });
    renderPage();

    expect(
      await screen.findByText('Não foi possível carregar a sua conta de recebimento'),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visão geral' })).toBeInTheDocument();
    expect(await createListing()).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await createListing()).toBeEnabled();
    expect(sellerAccountApi.get).toHaveBeenCalledTimes(2);
  });
});
