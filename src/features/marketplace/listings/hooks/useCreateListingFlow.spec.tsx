import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';

import { CreateListingFlow } from '../components/CreateListingFlow/CreateListingFlow';
import { listingsApi } from '../listings.api';
import { charizard, conditions } from '../test/listingsFixtures';
import { stepForError, useCreateListingFlow } from './useCreateListingFlow';

vi.mock('../listings.api', () => ({
  listingsApi: {
    getEligibility: vi.fn(),
    listConditions: vi.fn(),
    create: vi.fn(),
    searchCards: vi.fn(),
    uploadPhoto: vi.fn(),
  },
}));

const onConnectAccount = vi.fn();
const onCreated = vi.fn();
const ready = { canCreate: true, stripeAccountReady: true, hasPrimaryAddress: true };

function Harness() {
  const flow = useCreateListingFlow();
  return (
    <>
      <button type="button" onClick={() => flow.start(charizard)}>
        Anunciar esta carta
      </button>
      <CreateListingFlow flow={flow} onConnectAccount={onConnectAccount} onCreated={onCreated} />
    </>
  );
}

function renderFlow() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <Harness /> },
      { path: paths.profile, element: <h1>Perfil</h1> },
    ],
    { initialEntries: ['/'] },
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return userEvent.click(screen.getByRole('button', { name: 'Anunciar esta carta' }));
}

async function publishMint() {
  await userEvent.click(await screen.findByRole('radio', { name: 'Mint' }));
  await userEvent.type(screen.getByLabelText('Preço de Venda (R$)'), '1.850,00');
  await userEvent.click(screen.getByRole('button', { name: /Publicar anúncio/ }));
}

describe('useCreateListingFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listingsApi.getEligibility).mockResolvedValue(ready);
    vi.mocked(listingsApi.listConditions).mockResolvedValue(conditions);
  });

  it('CA7: sem a conta pronta, mostra o aviso e leva ao cadastro da conta', async () => {
    vi.mocked(listingsApi.getEligibility).mockResolvedValue({
      ...ready,
      canCreate: false,
      stripeAccountReady: false,
    });
    await renderFlow();

    expect(
      await screen.findByRole('alertdialog', {
        name: 'Conecte sua conta de recebimento antes de anunciar',
      }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Conectar conta Stripe' }));
    expect(onConnectAccount).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('CA8: sem endereço principal, pede o cadastro e leva ao Perfil', async () => {
    vi.mocked(listingsApi.getEligibility).mockResolvedValue({
      ...ready,
      canCreate: false,
      hasPrimaryAddress: false,
    });
    await renderFlow();

    expect(
      await screen.findByText(
        'Cadastre seu endereço principal antes de anunciar. Ele é a origem do frete.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar endereço' }));

    expect(await screen.findByRole('heading', { name: 'Perfil' })).toBeInTheDocument();
  });

  it('CA2: com tudo pronto, abre o formulário com a carta escolhida e publica', async () => {
    const listing = { id: 'listing-1' };
    vi.mocked(listingsApi.create).mockResolvedValue(listing as never);
    await renderFlow();

    expect(await screen.findByRole('combobox', { name: 'Carta do catálogo' })).toHaveValue(
      'Charizard VMAX Shiny Secret - Shining Fates (SV107/SV122)',
    );
    await publishMint();

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(listing));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('CA8: se a API recusar por falta de endereço, troca o formulário pelo pedido', async () => {
    vi.mocked(listingsApi.create).mockRejectedValue(
      new ApiError({ status: 422, code: 'PRIMARY_ADDRESS_REQUIRED', message: 'Sem endereço' }),
    );
    await renderFlow();
    await publishMint();

    expect(await screen.findByRole('button', { name: 'Cadastrar endereço' })).toBeInTheDocument();
  });

  it('CA10: outro erro da API mantém o formulário aberto com a mensagem', async () => {
    vi.mocked(listingsApi.getEligibility).mockRejectedValue(new Error('rede'));
    vi.mocked(listingsApi.create).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL', message: 'Tente de novo.' }),
    );
    await renderFlow();
    await publishMint();

    expect(await screen.findByRole('alert')).toHaveTextContent('Tente de novo.');
    expect(screen.getByRole('dialog', { name: 'Criar anúncio' })).toBeInTheDocument();
  });

  it('só troca de passo para os erros de conta e de endereço da API', () => {
    expect(stepForError(new Error('rede'))).toBeNull();
    expect(stepForError(new ApiError({ status: 500, code: 'INTERNAL', message: 'x' }))).toBeNull();
    expect(
      stepForError(new ApiError({ status: 422, code: 'STRIPE_ACCOUNT_NOT_READY', message: 'x' })),
    ).toBe('blocked');
  });
});
