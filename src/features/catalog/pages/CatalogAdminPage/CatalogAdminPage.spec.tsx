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

const LIST_PAGE = { page: 1, pageSize: 20 };

function listCalls() {
  return vi.mocked(catalogApi.listCards).mock.calls.filter(([params]) => params.pageSize !== 1);
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
    vi.mocked(catalogApi.listLanguages).mockReset().mockResolvedValue([]);
    vi.mocked(catalogApi.deleteItem).mockReset().mockResolvedValue(undefined);
  });

  it('CA1: abre na aba de cartas com a lista paginada, a busca e os filtros', async () => {
    renderPage();

    const table = await screen.findByRole('table', { name: 'Cartas do catálogo' });
    expect(within(table).getByText('Pelé')).toBeInTheDocument();
    expect(within(table).getByText('Copa 2026')).toBeInTheDocument();
    expect(within(table).getByText('Panini (2026)')).toBeInTheDocument();
    expect(within(table).getByText('670')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Todas as Cartas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText('Buscar carta pelo nome ou número')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent(
      'Mostrando registros 1 - 1 de 1 itens',
    );
    expect(catalogApi.listCards).toHaveBeenCalledWith(LIST_PAGE);
  });

  it('mostra o cabeçalho do catálogo e os totais nos indicadores e nas abas', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Gestão de Catálogo' })).toBeInTheDocument();
    const albums = await screen.findByRole('region', { name: 'Álbuns oficiais' });
    expect(await within(albums).findByText('1')).toBeInTheDocument();
    expect(within(albums).getByText('2 categorias & franquias')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Categorias & Franquias 2/ })).toBeInTheDocument();
  });

  it('CA1: troca de página pela paginação numerada', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Página 2' }));

    expect(catalogApi.listCards).toHaveBeenLastCalledWith({ page: 2, pageSize: 20 });
  });

  it('CA1: muda a quantidade de linhas por página e volta para a primeira', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Página 2' }));
    await userEvent.selectOptions(screen.getByLabelText('Linhas por página:'), '50');

    expect(catalogApi.listCards).toHaveBeenLastCalledWith({ page: 1, pageSize: 50 });
  });

  it('CA1: mostra o filtro ativo como chip e limpa todos os filtros', async () => {
    renderPage();
    await screen.findByRole('option', { name: 'Lendária' });
    await userEvent.selectOptions(screen.getByLabelText('Raridade'), RARITY.id);

    expect(screen.getByText('Raridade: Lendária')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar todos os filtros' }));

    expect(screen.queryByText('Raridade: Lendária')).not.toBeInTheDocument();
    expect(catalogApi.listCards).toHaveBeenLastCalledWith(LIST_PAGE);
  });

  it('CA1: filtra as cartas por raridade e só oferece categorias de carta', async () => {
    renderPage();
    const categorySelect = await screen.findByLabelText('Franquia');
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
    await userEvent.type(
      await screen.findByLabelText('Buscar carta pelo nome ou número'),
      ' Pelé ',
    );

    await vi.waitFor(() =>
      expect(catalogApi.listCards).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, q: 'Pelé' }),
    );
  });

  it('CA1: a aba de álbuns lista os álbuns e filtra pelo ano', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));

    const table = await screen.findByRole('table', { name: 'Álbuns do catálogo' });
    expect(within(table).getByText('670')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Ano'), '2026');

    expect(catalogApi.listAlbums).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, year: 2026 });
  });

  it('R15: a aba de categorias lista nome, tipo e categoria pai', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));

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
    await vi.waitFor(() => expect(listCalls()).toHaveLength(2));
  });

  it('R4: o botão de cadastro abre o formulário da carta', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Cadastrar Carta' }));

    expect(screen.getByRole('dialog', { name: 'Cadastrar carta' })).toBeInTheDocument();
  });

  it('R13: o botão de importação abre o modal do CSV', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Importar CSV' }));

    expect(screen.getByRole('dialog', { name: 'Importar cartas por CSV' })).toBeInTheDocument();
  });

  it('R5: o botão de novo álbum abre o formulário do álbum', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Novo Álbum' }));

    expect(screen.getByRole('dialog', { name: 'Novo álbum' })).toBeInTheDocument();
  });

  it('R15: a aba de categorias tem o botão de nova categoria', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));
    await userEvent.click(await screen.findByRole('button', { name: '+ Nova Categoria' }));

    expect(screen.getByRole('dialog', { name: 'Nova categoria' })).toBeInTheDocument();
  });

  it('CA1: remove um filtro pelo chip', async () => {
    renderPage();
    await screen.findByRole('option', { name: 'Lendária' });
    await userEvent.selectOptions(screen.getByLabelText('Raridade'), RARITY.id);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remover filtro Raridade: Lendária' }),
    );

    expect(catalogApi.listCards).toHaveBeenLastCalledWith(LIST_PAGE);
  });

  it('CA1: o filtro de ano dos álbuns vira chip', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));
    await userEvent.type(await screen.findByLabelText('Ano'), '2026');
    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Ano: 2026' }));

    expect(catalogApi.listAlbums).toHaveBeenLastCalledWith(LIST_PAGE);
  });
});
