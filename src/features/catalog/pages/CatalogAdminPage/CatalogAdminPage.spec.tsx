import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { PaginatedResponse } from '@/types/api';

import { catalogApi } from '../../catalog.api';
import type { Album, Card, Category } from '../../catalog.types';
import { CatalogAdminPage } from './CatalogAdminPage';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    listCards: vi.fn(),
    listAlbums: vi.fn(),
    listCategories: vi.fn(),
    listRarities: vi.fn(),
  },
}));

const TIMESTAMP = '2026-11-05T12:00:00.000Z';
const RARITY = { id: '0190f3a4-0000-7000-8000-000000000001', name: 'Lendária' };
const CARD_CATEGORY = { id: '0190f3a4-0000-7000-8000-000000000002', name: 'Seleções' };

const album: Album = {
  id: '0190f3a4-0000-7000-8000-000000000010',
  title: 'Copa 2026',
  publisher: 'Panini',
  year: 2026,
  description: null,
  coverUrl: null,
  totalCards: 670,
  categoryId: null,
  category: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

const card: Card = {
  id: '0190f3a4-0000-7000-8000-000000000020',
  name: 'Pelé',
  number: '10',
  description: null,
  frontImageUrl: 'https://hml-api.cromocard.com.br/uploads/cards/pele.webp',
  backImageUrl: null,
  albumId: album.id,
  categoryId: CARD_CATEGORY.id,
  rarityId: RARITY.id,
  languageId: null,
  album: { id: album.id, title: album.title },
  category: CARD_CATEGORY,
  rarity: RARITY,
  language: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

const categories: Category[] = [
  { ...CARD_CATEGORY, type: 'CARD', parentCategoryId: null, parentCategory: null },
  {
    id: '0190f3a4-0000-7000-8000-000000000003',
    name: 'Futebol',
    type: 'ALBUM',
    parentCategoryId: null,
    parentCategory: null,
  },
].map((category) => ({ ...category, createdAt: TIMESTAMP, updatedAt: TIMESTAMP }) as Category);

function pageOf<T>(data: T[], totalPages = 1): PaginatedResponse<T> {
  return { data, meta: { page: 1, pageSize: 20, total: data.length, totalPages } };
}

function renderPage() {
  renderWithProviders({
    routes: [{ path: paths.backoffice.catalog, element: <CatalogAdminPage /> }],
    initialPath: paths.backoffice.catalog,
  });
}

describe('CatalogAdminPage', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.listCards)
      .mockReset()
      .mockResolvedValue(pageOf([card], 3));
    vi.mocked(catalogApi.listAlbums)
      .mockReset()
      .mockResolvedValue(pageOf([album]));
    vi.mocked(catalogApi.listCategories).mockReset().mockResolvedValue(pageOf(categories));
    vi.mocked(catalogApi.listRarities).mockReset().mockResolvedValue([RARITY]);
  });

  it('CA1: abre na aba de cartas com a lista paginada, a busca e os filtros', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Cartas do catálogo' });
    expect(within(table).getByText('Pelé')).toBeInTheDocument();
    expect(within(table).getByText('Copa 2026')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Todas as Cartas' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Buscar carta pelo nome')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent(
      'Página 1 de 3',
    );
    expect(catalogApi.listCards).toHaveBeenCalledWith({ page: 1, pageSize: 20 });
  });

  it('CA1: filtra as cartas por raridade e só oferece categorias de carta', async () => {
    renderPage();
    const categorySelect = await screen.findByLabelText('Categoria');
    await screen.findByRole('option', { name: 'Lendária' });

    expect(
      within(categorySelect).queryByRole('option', { name: 'Futebol' }),
    ).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Raridade'), RARITY.id);

    expect(catalogApi.listCards).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      rarityId: RARITY.id,
    });
  });

  it('CA1: busca as cartas pelo nome', async () => {
    renderPage();
    await userEvent.type(await screen.findByLabelText('Buscar carta pelo nome'), ' Pelé ');

    await vi.waitFor(() =>
      expect(catalogApi.listCards).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, q: 'Pelé' }),
    );
  });

  it('CA1: a aba de álbuns lista os álbuns e filtra pelo ano', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Álbuns Oficiais' }));

    const table = await screen.findByRole('table', { name: 'Álbuns do catálogo' });
    expect(within(table).getByText('670')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Ano'), '2026');

    expect(catalogApi.listAlbums).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, year: 2026 });
  });

  it('R15: a aba de categorias lista nome, tipo e categoria pai', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Categorias & Franquias' }));

    const table = await screen.findByRole('table', { name: 'Categorias e franquias do catálogo' });
    expect(within(table).getByText('Futebol')).toBeInTheDocument();
    expect(within(table).getByText('Álbum')).toBeInTheDocument();
  });

  it('R3: mostra o estado vazio quando o filtro não encontra nada', async () => {
    vi.mocked(catalogApi.listCards).mockResolvedValue(pageOf<Card>([]));
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma carta encontrada' }),
    ).toBeInTheDocument();
  });
});
