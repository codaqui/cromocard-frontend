import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { catalogRequestsApi } from '../../catalog-requests.api';
import type { CatalogRequest, CatalogRequestsMeta } from '../../catalog-requests.types';
import { CatalogRequestsPage } from './CatalogRequestsPage';

vi.mock('../../catalog-requests.api', () => ({
  catalogRequestsApi: { list: vi.fn(), approve: vi.fn(), reject: vi.fn() },
}));

const card: CatalogRequest = {
  id: '0199a000-0000-7000-8000-000000008812',
  code: '#SOL-8812',
  type: 'CARD',
  status: 'PENDING',
  data: {
    name: 'Pikachu Promo Illustrator',
    number: '099',
    frontImageUrl: 'https://cdn.cromocard.dev/frente.png',
    backImageUrl: 'https://cdn.cromocard.dev/verso.png',
  },
  references: {
    album: 'CoroCoro Comics',
    category: 'Pokémon',
    rarity: 'Lendária',
    language: 'Japonês',
  },
  requester: { id: 'user-1', name: 'Lucas', username: 'lucas_slab_collector' },
  reviewedBy: null,
  reviewedAt: null,
  createdAt: '2026-11-10T12:00:00Z',
};

const album: CatalogRequest = {
  ...card,
  id: '0199a000-0000-7000-8000-000000004091',
  code: '#SOL-4091',
  type: 'ALBUM',
  data: { title: 'One Piece: Wings of the Captain', publisher: 'Bandai', year: 2024 },
  references: { category: 'One Piece' },
  requester: { id: 'user-2', name: 'Strawhat Seller', username: null },
};

const category: CatalogRequest = {
  ...card,
  id: '0199a000-0000-7000-8000-000000000028',
  code: '#SOL-0028',
  type: 'CATEGORY',
  data: { name: 'Disney Lorcana TCG', type: 'CARD' },
  references: {},
};

const meta: CatalogRequestsMeta = {
  page: 1,
  pageSize: 10,
  total: 14,
  totalPages: 2,
  pendingByType: { ALL: 14, CARD: 8, ALBUM: 4, CATEGORY: 2 },
};

const pageOf = (data: CatalogRequest[]) => ({ data, meta });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <CatalogRequestsPage />
    </QueryClientProvider>,
  );
}

const cardOf = (name: RegExp) => screen.findByRole('article', { name });
const lastListCall = () => vi.mocked(catalogRequestsApi.list).mock.lastCall?.[0];

describe('CatalogRequestsPage', () => {
  beforeEach(() => {
    vi.mocked(catalogRequestsApi.list)
      .mockReset()
      .mockResolvedValue(pageOf([card, album, category]));
    vi.mocked(catalogRequestsApi.approve).mockReset().mockResolvedValue(card);
    vi.mocked(catalogRequestsApi.reject).mockReset().mockResolvedValue(card);
  });

  it('mostra o carregando enquanto busca a fila', () => {
    vi.mocked(catalogRequestsApi.list).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByText('Carregando as solicitações…')).toBeInTheDocument();
  });

  it('CA1: mostra as abas com as pendentes e cada solicitação aberta com os dados sugeridos', async () => {
    renderPage();

    const cardItem = await cardOf(/Pikachu Promo Illustrator/);
    expect(screen.getByRole('tab', { name: /Todas/ })).toHaveTextContent('14');
    expect(screen.getByRole('tab', { name: /Cartas/ })).toHaveTextContent('8');
    expect(screen.getByRole('tab', { name: /Álbuns/ })).toHaveTextContent('4');
    expect(screen.getByRole('tab', { name: /Categorias/ })).toHaveTextContent('2');
    expect(screen.getByText('14 Pendentes')).toBeInTheDocument();
    expect(cardItem).toHaveTextContent('Protocolo #SOL-8812');
    expect(cardItem).toHaveTextContent('@lucas_slab_collector');
    for (const value of ['CoroCoro Comics', 'Pokémon', 'Lendária', 'Japonês', '099']) {
      expect(cardItem).toHaveTextContent(value);
    }
    expect(within(cardItem).getByRole('img', { name: /Frente/ })).toBeInTheDocument();
    expect(await cardOf(/One Piece/)).toHaveTextContent('Editora: Bandai • Ano: 2024');
    expect(await cardOf(/One Piece/)).toHaveTextContent('Strawhat Seller');
    expect(await cardOf(/Disney Lorcana/)).toHaveTextContent('Franquia de cartas');
  });

  it('CA1: a aba filtra pelo tipo e volta para a primeira página', async () => {
    renderPage();
    await cardOf(/Pikachu/);

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(lastListCall()).toMatchObject({ page: 2 });

    await userEvent.click(screen.getByRole('tab', { name: /Álbuns/ }));
    expect(lastListCall()).toEqual({ type: 'ALBUM', page: 1, pageSize: 10 });
  });

  it('informa quando não há solicitações pendentes', async () => {
    vi.mocked(catalogRequestsApi.list).mockResolvedValue(pageOf([]));

    renderPage();

    expect(await screen.findByText('Nenhuma solicitação pendente')).toBeInTheDocument();
  });

  it('mostra o erro da fila e tenta de novo', async () => {
    vi.mocked(catalogRequestsApi.list).mockRejectedValueOnce(new Error('Falha de rede'));

    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await cardOf(/Pikachu/)).toBeInTheDocument();
  });

  it('CA2: aprova depois de confirmar e mostra que a solicitação foi aprovada', async () => {
    renderPage();
    const cardItem = await cardOf(/Pikachu/);

    await userEvent.click(within(cardItem).getByRole('button', { name: 'Aprovar' }));
    const confirm = screen.getByRole('alertdialog', {
      name: 'Aprovar a sugestão Pikachu Promo Illustrator?',
    });
    expect(confirm).toHaveTextContent('@lucas_slab_collector recebe uma notificação');
    await userEvent.click(within(confirm).getByRole('button', { name: 'Aprovar' }));

    expect(vi.mocked(catalogRequestsApi.approve).mock.calls[0]?.[0]).toBe(card.id);
    expect(await screen.findByText('Solicitação aprovada')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Pikachu Promo Illustrator entrou no catálogo. O solicitante foi avisado.',
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByText('Solicitação aprovada')).not.toBeInTheDocument();
  });

  it('R12: cancelar a aprovação volta para a fila sem aprovar', async () => {
    renderPage();
    const albumItem = await cardOf(/One Piece/);

    await userEvent.click(within(albumItem).getByRole('button', { name: 'Aprovar' }));
    const confirm = screen.getByRole('alertdialog');
    expect(confirm).toHaveTextContent('O álbum entra no catálogo como foi sugerido,');
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(catalogRequestsApi.approve).not.toHaveBeenCalled();
  });

  it('CA4: recusar exige o motivo e envia o motivo informado', async () => {
    renderPage();
    const cardItem = await cardOf(/Pikachu/);

    await userEvent.click(within(cardItem).getByRole('button', { name: 'Recusar' }));
    const dialog = screen.getByRole('alertdialog', {
      name: 'Recusar a sugestão Pikachu Promo Illustrator?',
    });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Recusar' }));
    expect(
      await within(dialog).findByText('Informe o motivo para recusar a sugestão.'),
    ).toBeInTheDocument();
    expect(catalogRequestsApi.reject).not.toHaveBeenCalled();

    await userEvent.type(
      within(dialog).getByLabelText('Motivo (obrigatório)'),
      'Sem fonte oficial',
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Recusar' }));

    expect(vi.mocked(catalogRequestsApi.reject).mock.calls[0]?.[0]).toEqual({
      id: card.id,
      reason: 'Sem fonte oficial',
    });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('CA5: avisa quando a solicitação já foi processada por outro admin', async () => {
    vi.mocked(catalogRequestsApi.approve).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'REQUEST_ALREADY_REVIEWED',
        message: 'Esta solicitação já foi analisada',
        details: [
          { field: 'status', message: 'APPROVED' },
          { field: 'reviewedBy', message: 'fernanda_bi' },
          { field: 'reviewedAt', message: '2026-11-12T17:52:00.000Z' },
        ],
      }),
    );
    renderPage();

    await userEvent.click(
      within(await cardOf(/One Piece/)).getByRole('button', { name: 'Aprovar' }),
    );
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Aprovar' }),
    );

    const notice = await screen.findByRole('dialog', {
      name: 'Esta solicitação já foi processada',
    });
    expect(notice).toHaveTextContent(
      '#SOL-4091 (One Piece: Wings of the Captain) foi aprovada por @fernanda_bi',
    );
    await userEvent.click(within(notice).getByRole('button', { name: 'Voltar para a lista' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('CA6: conflito do catálogo explica o motivo e diz que continua pendente', async () => {
    vi.mocked(catalogRequestsApi.approve).mockRejectedValue(
      new ApiError({ status: 409, code: 'CARD_NUMBER_TAKEN', message: 'Número já usado' }),
    );
    renderPage();

    await userEvent.click(within(await cardOf(/Pikachu/)).getByRole('button', { name: 'Aprovar' }));
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Aprovar' }),
    );

    const notice = await screen.findByRole('dialog', { name: 'Não foi possível aprovar' });
    expect(notice).toHaveTextContent(
      'O número 099 já existe no álbum CoroCoro Comics. A solicitação continua pendente',
    );
  });

  it.each([
    ['sem conexão', new Error('Sem conexão.'), 'Sem conexão.'],
    [
      'erro 500',
      new ApiError({
        status: 500,
        code: 'INTERNAL_ERROR',
        message: 'Erro inesperado no servidor.',
      }),
      'Erro inesperado no servidor.',
    ],
  ])(
    'CA4: falha ao recusar (%s) avisa que a recusa falhou, e não a aprovação',
    async (_, error, text) => {
      vi.mocked(catalogRequestsApi.reject).mockRejectedValue(error);
      renderPage();

      await userEvent.click(
        within(await cardOf(/Disney/)).getByRole('button', { name: 'Recusar' }),
      );
      const dialog = screen.getByRole('alertdialog');
      await userEvent.type(within(dialog).getByLabelText('Motivo (obrigatório)'), 'Duplicada');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Recusar' }));

      const notice = await screen.findByRole('dialog', { name: 'Não foi possível recusar' });
      expect(notice).toHaveTextContent(text);
      expect(notice).toHaveTextContent('Ela continua pendente; tente recusar de novo.');
      expect(
        screen.queryByRole('dialog', { name: 'Não foi possível aprovar' }),
      ).not.toBeInTheDocument();
    },
  );
});
