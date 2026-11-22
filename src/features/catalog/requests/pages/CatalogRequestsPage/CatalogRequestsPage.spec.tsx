import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { catalogRequestsApi } from '../../catalog-requests.api';
import type { CatalogRequest, CatalogRequestsMeta } from '../../catalog-requests.types';
import { CatalogRequestsPage } from './CatalogRequestsPage';

vi.mock('../../catalog-requests.api', () => ({
  catalogRequestsApi: {
    list: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    downloadChecklist: vi.fn(),
  },
}));

const downloadFile = vi.hoisted(() => vi.fn());
vi.mock('@/lib/download-file', () => ({ downloadFile }));

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
  votes: null,
  checklistSummary: null,
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

  describe('campos da CCD103', () => {
    const fullCard: CatalogRequest = {
      ...card,
      data: {
        ...card.data,
        illustrator: 'Atsuko Nishida',
        estimatedPopulation: 39,
        justification: 'Entregue aos vencedores do concurso de 1998.',
        sources: [
          { label: 'PokéBeach Archive Database #PKB-98ILL', url: 'https://www.pokebeach.com/' },
          { label: 'Revista CoroCoro' },
        ],
      },
    };

    const fullAlbum: CatalogRequest = {
      ...album,
      data: {
        ...album.data,
        coverImageUrl: 'https://cdn.cromocard.dev/capa.png',
        checklist: [
          {
            number: '001',
            code: 'OP06-001',
            name: 'Yamato',
            rarity: 'Rara',
            variants: 'Textured Foil',
          },
          {
            number: '022',
            code: 'OP06-022',
            name: 'Roronoa Zoro',
            rarity: 'Lendária',
            variants: 'Manga',
          },
        ],
      },
      checklistSummary: {
        total: 126,
        rarities: [
          { name: 'Lendária', count: 2 },
          { name: 'Épica', count: 10 },
          { name: 'Rara', count: 24 },
        ],
      },
    };

    const fullCategory: CatalogRequest = {
      ...category,
      data: {
        ...category.data,
        description: 'Card game da Disney publicado pela Ravensburger.',
        publisher: 'Ravensburger',
        logoUrl: 'https://cdn.cromocard.dev/logo.png',
        subcategories: ['The First Chapter', 'Rise of the Floodborn', 'Into the Inklands'],
      },
      votes: {
        for: 331,
        neutral: 6,
        against: 3,
        total: 340,
        goal: 200,
        forPercent: 97.4,
        goalPercent: 170,
      },
    };

    beforeEach(() => {
      vi.mocked(catalogRequestsApi.list).mockResolvedValue(
        pageOf([fullCard, fullAlbum, fullCategory]),
      );
      downloadFile.mockReset();
    });

    it('R10: a carta mostra ilustrador, população, justificativa e as fontes com link', async () => {
      renderPage();

      const item = await cardOf(/Pikachu/);
      expect(item).toHaveTextContent('Atsuko Nishida');
      expect(item).toHaveTextContent('39 Cópias Globais');
      expect(item).toHaveTextContent('“Entregue aos vencedores do concurso de 1998.”');
      expect(within(item).getByRole('link', { name: /PokéBeach Archive/ })).toHaveAttribute(
        'href',
        'https://www.pokebeach.com/',
      );
      expect(within(item).getByText('Revista CoroCoro')).toBeInTheDocument();
    });

    it('CA4: a categoria mostra 340/200 (170% da meta), a divisão dos votos e o selo', async () => {
      renderPage();

      const item = await cardOf(/Disney/);
      expect(item).toHaveTextContent('Votação da comunidade (meta: 200 votos)');
      expect(item).toHaveTextContent('340 / 200 Votos (170% da Meta)');
      for (const value of ['331 (97,4%)', '6 (1,8%)', '3 (0,9%)', '340 votos', '97,4% a favor']) {
        expect(item).toHaveTextContent(value);
      }
      expect(within(item).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      expect(item).not.toHaveTextContent('@lucas_slab_collector');
    });

    it('CA4: o selo de votos usa o singular quando há um só voto', async () => {
      vi.mocked(catalogRequestsApi.list).mockResolvedValue(
        pageOf([
          {
            ...fullCategory,
            votes: {
              for: 1,
              neutral: 0,
              against: 0,
              total: 1,
              goal: 200,
              forPercent: 100,
              goalPercent: 0.5,
            },
          },
        ]),
      );
      renderPage();

      const item = await cardOf(/Disney/);

      expect(item).toHaveTextContent('1 voto100% a favor');
      expect(item).not.toHaveTextContent('1 votos');
    });

    it('CA5: a categoria lista as subcategorias a criar e o rodapé conta quantas', async () => {
      renderPage();

      const item = await cardOf(/Disney/);
      for (const name of fullCategory.data.subcategories ?? []) {
        expect(within(item).getByText(name)).toBeInTheDocument();
      }
      expect(item).toHaveTextContent(
        'Ao aprovar, a categoria e as 3 subcategorias são criadas e a votação é encerrada.',
      );
    });

    it('CA6: o álbum mostra o resumo e o checklist e baixa a planilha em CSV', async () => {
      const blob = new Blob(['csv']);
      vi.mocked(catalogRequestsApi.downloadChecklist).mockResolvedValue(blob);
      renderPage();

      const item = await cardOf(/One Piece/);
      for (const value of [
        '126 cartas',
        'Lendárias',
        'Épicas',
        'Raras',
        '24 cartas',
        'OP06-022',
        'Roronoa Zoro',
        'Textured Foil',
      ]) {
        expect(item).toHaveTextContent(value);
      }
      await userEvent.click(within(item).getByRole('button', { name: 'Baixar Planilha .CSV' }));

      expect(catalogRequestsApi.downloadChecklist).toHaveBeenCalledWith(album.id);
      expect(downloadFile).toHaveBeenCalledWith(blob, 'checklist-SOL-4091.csv');
    });

    it('CA6: falha ao baixar a planilha é avisada no cartão', async () => {
      vi.mocked(catalogRequestsApi.downloadChecklist).mockRejectedValue(new Error('offline'));
      renderPage();

      const item = await cardOf(/One Piece/);
      await userEvent.click(within(item).getByRole('button', { name: 'Baixar Planilha .CSV' }));

      expect(
        await within(item).findByText('Não foi possível baixar a planilha. Tente de novo.'),
      ).toBeInTheDocument();
    });

    it('CA11: mostra a capa do álbum com o total do checklist e o logo da categoria', async () => {
      renderPage();

      const albumItem = await cardOf(/One Piece/);
      expect(within(albumItem).getByRole('img', { name: /Capa sugerida/ })).toHaveAttribute(
        'src',
        'https://cdn.cromocard.dev/capa.png',
      );
      expect(albumItem).toHaveTextContent('BANDAI 2024');
      expect(albumItem).toHaveTextContent('126 Cartas no Checklist');
      const categoryItem = screen.getByRole('article', { name: /Disney/ });
      expect(within(categoryItem).getByRole('img', { name: /Logo enviado/ })).toBeInTheDocument();
      expect(categoryItem).toHaveTextContent('RAVENSBURGER');
    });

    it('CA11: capa sem editora nem ano e logo sem editora aparecem sem o selo; carta sem imagens não tem a coluna', async () => {
      const bareAlbum = {
        ...fullAlbum,
        data: { ...fullAlbum.data, publisher: undefined, year: undefined },
      };
      const bareCategory = {
        ...fullCategory,
        data: { ...fullCategory.data, publisher: undefined },
      };
      const noImages = { ...card, data: { name: 'Mewtwo', number: '010' } };
      vi.mocked(catalogRequestsApi.list).mockResolvedValue(
        pageOf([noImages, bareAlbum, bareCategory]),
      );
      renderPage();

      const albumItem = await cardOf(/One Piece/);
      expect(within(albumItem).getByRole('img', { name: /Capa sugerida/ })).toBeInTheDocument();
      expect(albumItem).not.toHaveTextContent('BANDAI');
      expect(screen.getByRole('article', { name: /Disney/ })).not.toHaveTextContent('RAVENSBURGER');
      expect(screen.getByRole('article', { name: /Mewtwo/ })).not.toHaveTextContent(
        'Imagens enviadas',
      );
    });

    it('CA11: sem imagem, a capa e o logo não aparecem', async () => {
      vi.mocked(catalogRequestsApi.list).mockResolvedValue(pageOf([album, category]));
      renderPage();

      expect(await cardOf(/One Piece/)).not.toHaveTextContent('Capa sugerida');
      expect(screen.getByRole('article', { name: /Disney/ })).not.toHaveTextContent('Logo enviado');
      expect(screen.getByRole('article', { name: /Disney/ })).toHaveTextContent(
        'Ao aprovar, a categoria é criada e a votação é encerrada.',
      );
    });
  });
});
