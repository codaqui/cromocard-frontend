import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Card } from '../../catalog.types';
import {
  album,
  albumCategory,
  card,
  cardCategory,
  pageOf,
  rarity,
} from '../../test/catalogFixtures';
import { CatalogAdminPage } from './CatalogAdminPage';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    listCards: vi.fn(),
    listAlbums: vi.fn(),
    listCategories: vi.fn(),
    listRarities: vi.fn(),
    listLanguages: vi.fn(),
    deleteItem: vi.fn(),
  },
}));

const RARITY = rarity;
const categories = [cardCategory, albumCategory];

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
    vi.mocked(catalogApi.listLanguages).mockReset().mockResolvedValue([]);
    vi.mocked(catalogApi.deleteItem).mockReset().mockResolvedValue(undefined);
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

  it('R9: exclui a carta, confirma a operação e atualiza a lista', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir Pelé' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Carta excluída com sucesso.')).toBeInTheDocument();
    expect(catalogApi.deleteItem).toHaveBeenCalledWith('card', card.id);
    await vi.waitFor(() => expect(catalogApi.listCards).toHaveBeenCalledTimes(2));
  });

  it('R4: o botão de cadastro abre o formulário da carta', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Cadastrar Carta' }));

    expect(screen.getByRole('dialog', { name: 'Cadastrar carta' })).toBeInTheDocument();
  });
});
