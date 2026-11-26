import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { listingsApi } from '../../listings.api';
import type { ListingSummary } from '../../listings.types';
import { CardListingsList } from './CardListingsList';

vi.mock('../../listings.api', () => ({ listingsApi: { listByCard: vi.fn() } }));

const CARD_ID = 'card-1';

const listingOf = (
  id: string,
  price: string,
  condition: string | null = 'Mint',
): ListingSummary => ({
  id,
  price,
  condition: condition === null ? null : { name: condition },
  seller: { id: `s-${id}`, username: `vendedor_${id}` },
});

function pageOf(items: ListingSummary[], page: number, totalPages: number) {
  return {
    data: items,
    meta: { page, pageSize: 20, total: items.length * totalPages, totalPages },
  };
}

function renderList(count = 3) {
  renderWithProviders({
    initialPath: '/',
    routes: [
      {
        path: '/',
        element: <CardListingsList cardId={CARD_ID} count={count} canCreateListing={false} />,
      },
    ],
  });
}

const rows = () =>
  within(screen.getByRole('list', { name: 'Anúncios disponíveis' })).getAllByRole('listitem');

describe('CardListingsList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('o título usa o total da lista quando ele diverge da contagem do perfil', async () => {
    vi.mocked(listingsApi.listByCard).mockResolvedValue({
      data: [listingOf('a', '1750.00'), listingOf('b', '1980.00')],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
    renderList(5);

    expect(await screen.findByRole('heading', { name: 'Anúncios disponíveis (2)' })).toBeVisible();
    expect(rows()).toHaveLength(2);
  });

  it('mostra o estado vazio quando a lista volta sem anúncios', async () => {
    vi.mocked(listingsApi.listByCard).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    });
    renderList(1);

    expect(await screen.findByRole('heading', { name: 'Anúncios disponíveis (0)' })).toBeVisible();
  });

  it('CA2: mostra os anúncios na ordem da API, com preço e condição, e destaca o primeiro', async () => {
    vi.mocked(listingsApi.listByCard).mockResolvedValue(
      pageOf(
        [listingOf('a', '1750.00'), listingOf('b', '1980.00'), listingOf('c', '2390.00', null)],
        1,
        1,
      ),
    );
    renderList();

    await screen.findByText('vendedor_a');
    expect(rows().map((row) => within(row).getByText(/^R\$/).textContent)).toEqual([
      'R$ 1.750',
      'R$ 1.980',
      'R$ 2.390',
    ]);
    expect(within(rows()[2] as HTMLElement).getByText('—')).toBeVisible();
    expect(listingsApi.listByCard).toHaveBeenCalledWith(CARD_ID, { page: 1, pageSize: 20 });
    expect(
      screen.getByText('Pagamento retido pela CromoCard até você receber a carta'),
    ).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Ordenar:' })).toHaveDisplayValue('Menor preço');
  });

  it('R18: Carregar mais traz a próxima página e some quando acaba', async () => {
    vi.mocked(listingsApi.listByCard)
      .mockResolvedValueOnce(pageOf([listingOf('a', '10.00')], 1, 2))
      .mockResolvedValueOnce(pageOf([listingOf('b', '20.50')], 2, 2));
    renderList(2);

    await userEvent.click(await screen.findByRole('button', { name: 'Carregar mais' }));

    expect(await screen.findByText('vendedor_b')).toBeVisible();
    expect(screen.getByText('R$ 20,50')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument();
    expect(listingsApi.listByCard).toHaveBeenLastCalledWith(CARD_ID, { page: 2, pageSize: 20 });
  });

  it('mostra o erro quando a lista não carrega', async () => {
    vi.mocked(listingsApi.listByCard).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL', message: 'Erro' }),
    );
    renderList();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os anúncios.',
    );
  });

  it('mostra ? e o traço quando o vendedor não tem nome de usuário', async () => {
    const anonymous = { ...listingOf('x', '50.00'), seller: { id: 's', username: null } };
    vi.mocked(listingsApi.listByCard).mockResolvedValue(pageOf([anonymous], 1, 1));
    renderList(1);

    const row = (await screen.findByText('?')).closest('li') as HTMLElement;

    expect(within(row).getByText('—')).toBeVisible();
  });
});
