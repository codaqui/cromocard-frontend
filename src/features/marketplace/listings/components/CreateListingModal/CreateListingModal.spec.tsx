import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { listingsApi } from '../../listings.api';
import { cardPage, charizard, conditions } from '../../test/listingsFixtures';
import { CreateListingModal, type CreateListingModalProps } from './CreateListingModal';

vi.mock('../../listings.api', () => ({
  listingsApi: { searchCards: vi.fn(), uploadPhoto: vi.fn() },
}));

const onSubmit = vi.fn();
const onClose = vi.fn();
const normalize = (text: string | null) => text?.replace(/\s/g, ' ');

function renderModal(props: Partial<CreateListingModalProps> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <CreateListingModal
        initialCard={charizard}
        conditions={conditions}
        isSubmitting={false}
        apiError={null}
        onClose={onClose}
        onSubmit={onSubmit}
        {...props}
      />
    </QueryClientProvider>,
  );
}

const publish = () => userEvent.click(screen.getByRole('button', { name: /Publicar anúncio/ }));

async function fillListing(price: string) {
  await userEvent.click(screen.getByRole('radio', { name: 'Mint' }));
  await userEvent.type(screen.getByLabelText('Preço de Venda (R$)'), price);
  await userEvent.type(screen.getByLabelText('Descrição do Anúncio'), 'Carta perfeita sem marcas');
}

describe('CreateListingModal', () => {
  beforeEach(() => {
    onSubmit.mockReset();
    onClose.mockReset();
  });

  it('CA1: mostra a taxa e o líquido enquanto digita e publica o anúncio', async () => {
    renderModal();
    await fillListing('1.850,00');

    expect(normalize(screen.getByText(/^- R\$/).textContent)).toBe('- R$ 92,50');
    expect(
      normalize(screen.getByText('Você recebe líquido:').nextSibling?.textContent ?? null),
    ).toBe('R$ 1.757,50');
    await publish();

    expect(onSubmit).toHaveBeenCalledWith(
      {
        cardId: charizard.id,
        conditionId: 'condition-1',
        price: '1850.00',
        availableQuantity: 1,
        description: 'Carta perfeita sem marcas',
        photoUrls: [],
      },
      expect.anything(),
    );
  });

  it('CA4: preço zerado mostra a mensagem e não publica', async () => {
    renderModal();
    await fillListing('0');
    await publish();

    expect(
      await screen.findByText('Por favor, insira um valor válido maior que zero'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('CA13: sem carta, sem condição e com quantidade 100 mostra o erro em cada campo', async () => {
    renderModal({ initialCard: null });
    await userEvent.type(screen.getByLabelText('Preço de Venda (R$)'), '10');
    const quantity = screen.getByLabelText('Quantidade Disponível');
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '100');
    await publish();

    expect(await screen.findByText('Escolha a carta no catálogo')).toBeInTheDocument();
    expect(screen.getByText('Escolha a condição da carta')).toBeInTheDocument();
    expect(screen.getByText('Informe uma quantidade de 1 a 99')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('CA10: em carregamento, o botão fica desabilitado e o modal não fecha', () => {
    renderModal({ isSubmitting: true });

    expect(screen.getByRole('button', { name: /Publicando…/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('CA10: com erro da API, o formulário continua preenchido e mostra o erro', async () => {
    const view = renderModal();
    await fillListing('1.850,00');
    view.rerender(
      <QueryClientProvider client={new QueryClient()}>
        <CreateListingModal
          initialCard={charizard}
          conditions={conditions}
          isSubmitting={false}
          apiError={new ApiError({ status: 500, code: 'INTERNAL', message: 'Tente de novo.' })}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Tente de novo.');
    expect(screen.getByLabelText('Preço de Venda (R$)')).toHaveValue('1.850,00');
  });

  it('R3: escolher a carta na busca tira o erro do campo', async () => {
    vi.mocked(listingsApi.searchCards).mockResolvedValue(cardPage([charizard]));
    renderModal({ initialCard: null });
    await publish();
    expect(await screen.findByText('Escolha a carta no catálogo')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('combobox', { name: 'Carta do catálogo' }), 'char');
    await userEvent.click(await screen.findByRole('button', { name: /Charizard VMAX/ }));

    expect(screen.queryByText('Escolha a carta no catálogo')).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('combobox', { name: 'Carta do catálogo' }), 'x');
    expect(await screen.findByText('Escolha a carta no catálogo')).toBeInTheDocument();
  });

  it('R3: publica com a carta escolhida na busca', async () => {
    vi.mocked(listingsApi.searchCards).mockResolvedValue(cardPage([charizard]));
    renderModal({ initialCard: null });
    await userEvent.type(screen.getByRole('combobox', { name: 'Carta do catálogo' }), 'char');
    await userEvent.click(await screen.findByRole('button', { name: /Charizard VMAX/ }));
    await fillListing('10');
    await publish();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: charizard.id }),
      expect.anything(),
    );
  });

  it('cancelar fecha o modal', async () => {
    renderModal();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
