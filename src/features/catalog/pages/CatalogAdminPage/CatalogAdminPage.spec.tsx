import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Card } from '../../catalog.types';
import {
  album,
  card,
  cardCategory,
  listedCategories,
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
    getSummary: vi.fn(),
    bulkDeleteCards: vi.fn(),
  },
}));

const SUMMARY = {
  albums: 142,
  licensedAlbums: 128,
  pendingAlbumRequests: 14,
  albumYears: [2026, 1999],
};

const secondCard: Card = {
  ...card,
  id: '0190f3a4-0000-7000-8000-000000000021',
  name: 'Garrincha',
  code: null,
  variants: null,
};
const thirdCard: Card = {
  ...card,
  id: '0190f3a4-0000-7000-8000-000000000022',
  name: 'Zico',
  number: '8',
};

const RARITY = rarity;

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
    vi.mocked(catalogApi.listCategories).mockReset().mockImplementation(listedCategories);
    vi.mocked(catalogApi.listRarities).mockReset().mockResolvedValue([RARITY]);
    vi.mocked(catalogApi.listLanguages).mockReset().mockResolvedValue([]);
    vi.mocked(catalogApi.deleteItem).mockReset().mockResolvedValue(undefined);
    vi.mocked(catalogApi.getSummary).mockReset().mockResolvedValue(SUMMARY);
    vi.mocked(catalogApi.bulkDeleteCards).mockReset();
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
    expect(screen.getByLabelText('Buscar carta pelo nome, número ou código')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Paginação' })).toHaveTextContent(
      'Mostrando registros 1 - 1 de 1 itens',
    );
    expect(catalogApi.listCards).toHaveBeenCalledWith(LIST_PAGE);
  });

  it('CA4: mostra o total de álbuns, os licenciados e os pendentes de revisão, e os totais nas abas', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Gestão de Catálogo' })).toBeInTheDocument();
    const total = await screen.findByRole('region', { name: 'Total de álbuns' });
    expect(await within(total).findByText('142')).toBeInTheDocument();
    const licensed = screen.getByRole('region', { name: 'Álbuns licenciados' });
    expect(within(licensed).getByText('128')).toBeInTheDocument();
    expect(within(licensed).getByText('14 pendentes de revisão')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Categorias & Franquias 2/ })).toBeInTheDocument();
  });

  it('CA4: com uma solicitação pendente, o texto fica no singular', async () => {
    vi.mocked(catalogApi.getSummary).mockResolvedValue({ ...SUMMARY, pendingAlbumRequests: 1 });
    renderPage();

    expect(await screen.findByText('1 pendente de revisão')).toBeInTheDocument();
  });

  it('R8: a lista mostra o código e as variantes da carta, e "Sem código" quando não tem', async () => {
    vi.mocked(catalogApi.listCards).mockResolvedValue(pageOf([card, secondCard]));
    renderPage();

    const table = await screen.findByRole('table', { name: 'Cartas do catálogo' });
    expect(within(table).getByText('#CRD-FUT-0010')).toBeInTheDocument();
    expect(within(table).getByText('Holofoil')).toBeInTheDocument();
    expect(within(table).getByText('Shadowless')).toBeInTheDocument();
    expect(within(table).getByText('Sem código')).toBeInTheDocument();
  });

  it('CA6: filtra pelo ano do álbum e limpa todos os filtros', async () => {
    renderPage();
    await screen.findByRole('option', { name: '2026' });
    await userEvent.selectOptions(screen.getByLabelText('Ano'), '2026');

    expect(catalogApi.listCards).toHaveBeenLastCalledWith({ ...LIST_PAGE, year: '2026' });
    expect(screen.getByText('Ano: 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar todos os filtros' }));

    expect(screen.queryByText('Ano: 2026')).not.toBeInTheDocument();
    expect(catalogApi.listCards).toHaveBeenLastCalledWith(LIST_PAGE);
  });

  it('L16: o filtro Ano oferece os anos que o resumo devolve, mesmo de álbuns fora da lista carregada', async () => {
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(pageOf([]));
    renderPage();
    const yearSelect = await screen.findByLabelText('Ano');
    await within(yearSelect).findByRole('option', { name: '1999' });

    expect(
      within(yearSelect)
        .getAllByRole('option')
        .map(({ textContent }) => textContent),
    ).toEqual(['Todos os anos', '2026', '1999']);
  });

  it('L12: o filtro de status da CCD106 aparece desabilitado', async () => {
    renderPage();

    expect(await screen.findByLabelText('Status')).toBeDisabled();
  });

  it('R2: a ação Duplicar só existe nas cartas e abre o "Duplicar carta"', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: `Duplicar ${card.name}` }));

    expect(screen.getByRole('dialog', { name: 'Duplicar carta' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome da carta *')).toHaveValue(card.name);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));
    await screen.findByRole('table', { name: 'Álbuns do catálogo' });
    expect(screen.queryByRole('button', { name: /^Duplicar/ })).not.toBeInTheDocument();
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

  it('CA1, L11: filtra as cartas por raridade e oferece todas as franquias', async () => {
    renderPage();
    const categorySelect = await screen.findByLabelText('Franquia');
    await screen.findByRole('option', { name: 'Lendária' });

    expect(await within(categorySelect).findByRole('option', { name: 'Futebol' })).toBeVisible();
    expect(catalogApi.listCategories).toHaveBeenCalledWith({ page: 1, pageSize: 100 });
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
      await screen.findByLabelText('Buscar carta pelo nome, número ou código'),
      ' Pelé ',
    );

    await vi.waitFor(() =>
      expect(catalogApi.listCards).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, q: 'Pelé' }),
    );
  });

  it('CA1: a aba de álbuns lista título, editora, ano, cartas e status', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));

    const table = await screen.findByRole('table', { name: 'Álbuns do catálogo' });
    const headers = within(table)
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent);
    expect(headers).toEqual([
      'Capa',
      'Título e editora',
      'Ano',
      'Franquia',
      'Cartas',
      'Status',
      'Ações',
    ]);
    expect(within(table).getByText('Panini')).toBeInTheDocument();
    expect(within(table).getByText('2026')).toBeInTheDocument();
    expect(within(table).getByText('670')).toBeInTheDocument();
    expect(within(table).getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('1 álbum encontrado')).toBeInTheDocument();
  });

  it('R5: álbum inativo e sem ano aparece com o status e o travessão', async () => {
    vi.mocked(catalogApi.listAlbums).mockResolvedValue(
      pageOf([{ ...album, year: null, status: 'INACTIVE' as const }]),
    );
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));

    const table = await screen.findByRole('table', { name: 'Álbuns do catálogo' });
    expect(within(table).getByText('Inativo')).toBeInTheDocument();
    expect(within(table).getAllByRole('cell')[2]).toHaveTextContent('—');
  });

  it('R2: os botões do topo mudam com a aba, como no Figma', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Importar CSV' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));

    expect(screen.getByRole('button', { name: '+ Novo Álbum' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Importar CSV' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Cadastrar Carta' })).not.toBeInTheDocument();
  });

  it('CA9: excluir o álbum pede a confirmação e só exclui depois dela', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));
    await userEvent.click(await screen.findByRole('button', { name: `Excluir ${album.title}` }));

    expect(screen.getByText(`Excluir "${album.title}" do catálogo?`)).toBeInTheDocument();
    expect(catalogApi.deleteItem).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await vi.waitFor(() => expect(catalogApi.deleteItem).toHaveBeenCalledWith('album', album.id));
    expect(await screen.findByText('Álbum excluído do catálogo')).toBeInTheDocument();
  });

  it('R15: a aba de categorias lista nome e categoria pai, sem a coluna Tipo (L11)', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));

    const table = await screen.findByRole('table', { name: 'Categorias e franquias do catálogo' });
    expect(within(table).getByText('Futebol')).toBeInTheDocument();
    expect(within(table).queryByText('Álbum')).not.toBeInTheDocument();
  });

  it('CA14 e CA1: a aba mostra o nome com o slug e o selo e a quantidade de cartas', async () => {
    const pokemon = {
      ...cardCategory,
      name: 'Pokémon',
      slug: 'pokemon',
      badge: 'TRENDING' as const,
      cardsCount: 18240,
    };
    vi.mocked(catalogApi.listCategories).mockResolvedValue(pageOf([pokemon]));
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));

    const table = await screen.findByRole('table', { name: 'Categorias e franquias do catálogo' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Nome e slug', 'Categoria pai', 'Cartas', 'Ações']);
    const row = within(table).getByRole('row', { name: /Pokémon/ });
    expect(within(row).getByText('pokemon')).toBeInTheDocument();
    expect(within(row).getByText('Em alta')).toBeInTheDocument();
    expect(within(row).getByText('18.240')).toBeInTheDocument();
  });

  it('CA14: a categoria sem selo não mostra nenhum selo', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));

    const table = await screen.findByRole('table', { name: 'Categorias e franquias do catálogo' });
    expect(within(table).queryByText('Padrão')).not.toBeInTheDocument();
    expect(within(table).queryByText('Em alta')).not.toBeInTheDocument();
  });

  it('CA15: busca as categorias pelo nome ou pelo slug', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));
    await userEvent.type(
      await screen.findByLabelText('Buscar categoria pelo nome ou slug'),
      ' magic-the ',
    );

    await vi.waitFor(() =>
      expect(catalogApi.listCategories).toHaveBeenLastCalledWith({ ...LIST_PAGE, q: 'magic-the' }),
    );
    expect(screen.getByPlaceholderText('Buscar por nome ou slug…')).toBeInTheDocument();
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

    expect(await screen.findByText('Carta excluída do catálogo')).toBeInTheDocument();
    expect(screen.getByText('Pelé saiu das buscas.')).toBeInTheDocument();
    expect(catalogApi.deleteItem).toHaveBeenCalledWith('card', card.id);
    await vi.waitFor(() => expect(listCalls()).toHaveLength(2));
  });

  it('R4: o botão de cadastro abre o formulário da carta', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: '+ Cadastrar Carta' }));

    expect(screen.getByRole('dialog', { name: 'Cadastrar nova carta' })).toBeInTheDocument();
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

  it('R4: o lápis da linha abre a edição da carta e do álbum', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Pelé' }));
    expect(screen.getByRole('dialog', { name: 'Editar carta' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));
    await userEvent.click(await screen.findByRole('button', { name: `Editar ${album.title}` }));
    expect(screen.getByRole('dialog', { name: 'Editar álbum' })).toBeInTheDocument();
  });

  it('R4: o lápis da linha abre a edição da categoria', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Futebol' }));

    expect(screen.getByRole('dialog', { name: 'Editar categoria' })).toBeInTheDocument();
  });

  it('CA1: a busca vira chip e sai pelo chip', async () => {
    renderPage();
    await userEvent.type(
      await screen.findByLabelText('Buscar carta pelo nome, número ou código'),
      'Pelé',
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remover filtro Busca: Pelé' }),
    );

    expect(screen.getByLabelText('Buscar carta pelo nome, número ou código')).toHaveValue('');
  });

  it('CA1: avança de página pelo botão da paginação', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Próxima página' }));

    await vi.waitFor(() =>
      expect(catalogApi.listCards).toHaveBeenLastCalledWith(
        expect.objectContaining({ ...LIST_PAGE, page: 2 }),
      ),
    );
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

  it('L11: a aba de categorias não tem mais o filtro por tipo', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Categorias & Franquias/ }));
    await screen.findByRole('table', { name: 'Categorias e franquias do catálogo' });

    expect(screen.queryByLabelText('Tipo')).not.toBeInTheDocument();
    expect(catalogApi.listCategories).toHaveBeenLastCalledWith(LIST_PAGE);
  });

  it('CA1: a aba de álbuns filtra pela franquia', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: /Álbuns Oficiais/ }));
    const franchise = await screen.findByLabelText('Franquia');
    await within(franchise).findByRole('option', { name: 'Futebol' });
    await userEvent.selectOptions(
      franchise,
      within(franchise).getByRole('option', { name: 'Futebol' }),
    );

    expect(screen.getByText('Franquia: Futebol')).toBeInTheDocument();
  });
  describe('exclusão em lote (CCD105)', () => {
    const REASON = 'Cartas duplicadas na importação';

    beforeEach(() => {
      vi.mocked(catalogApi.listCards).mockResolvedValue(pageOf([card, secondCard, thirdCard]));
    });

    async function selectCards(...names: string[]) {
      await screen.findByRole('table', { name: 'Cartas do catálogo' });
      for (const name of names) {
        await userEvent.click(screen.getByRole('checkbox', { name: `Selecionar ${name}` }));
      }
    }

    it('CA7: exclui as selecionadas com o motivo e avisa quantas saíram', async () => {
      vi.mocked(catalogApi.bulkDeleteCards).mockResolvedValue({
        deleted: [card.id, secondCard.id],
        skipped: [],
      });
      renderPage();
      await selectCards(card.name, secondCard.name);

      expect(screen.getByText('2 selecionadas')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Excluir selecionadas' }));
      const dialog = screen.getByRole('alertdialog', { name: 'Excluir 2 cartas?' });
      expect(within(dialog).queryByRole('button', { name: 'Fechar' })).not.toBeInTheDocument();
      expect(within(dialog).getByText(/^Pelé e Garrincha saem do catálogo./)).toBeInTheDocument();
      await userEvent.type(within(dialog).getByLabelText('Motivo (obrigatório)'), REASON);
      await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir 2 cartas' }));

      await vi.waitFor(() =>
        expect(catalogApi.bulkDeleteCards).toHaveBeenCalledWith({
          ids: [card.id, secondCard.id],
          reason: REASON,
        }),
      );
      expect(await screen.findByText('2 cartas excluídas do catálogo')).toBeInTheDocument();
      expect(
        screen.getByText('A exclusão foi registrada no log de auditoria.'),
      ).toBeInTheDocument();
      expect(screen.queryByText('2 selecionadas')).not.toBeInTheDocument();
    });

    it('R10: sem motivo, o lote não é excluído', async () => {
      renderPage();
      await selectCards(card.name);
      await userEvent.click(screen.getByRole('button', { name: 'Excluir selecionadas' }));
      await userEvent.click(screen.getByRole('button', { name: 'Excluir 1 carta' }));

      expect(
        await screen.findByText('O motivo precisa ter pelo menos 3 caracteres'),
      ).toBeInTheDocument();
      expect(catalogApi.bulkDeleteCards).not.toHaveBeenCalled();
    });

    it('CA9: o aviso lista as cartas que ficaram por estarem em coleções', async () => {
      vi.mocked(catalogApi.bulkDeleteCards).mockResolvedValue({
        deleted: [card.id],
        skipped: [
          { id: thirdCard.id, name: 'Zico', number: '8' },
          { id: secondCard.id, name: 'Garrincha', number: null },
        ],
      });
      renderPage();
      await userEvent.click(
        await screen.findByRole('checkbox', { name: 'Selecionar as cartas da página' }),
      );
      await userEvent.click(screen.getByRole('button', { name: 'Excluir selecionadas' }));
      await userEvent.type(screen.getByLabelText('Motivo (obrigatório)'), REASON);
      await userEvent.click(screen.getByRole('button', { name: 'Excluir 3 cartas' }));

      expect(await screen.findByText('1 carta excluída do catálogo')).toBeInTheDocument();
      expect(
        screen.getByText('Zico nº 008 e Garrincha ficaram porque estão em coleções.'),
      ).toBeInTheDocument();
    });

    it('R10: marca e desmarca a página inteira e limpa a seleção', async () => {
      renderPage();
      const pageCheckbox = await screen.findByRole('checkbox', {
        name: 'Selecionar as cartas da página',
      });
      await userEvent.click(pageCheckbox);

      expect(screen.getByText('3 selecionadas')).toBeInTheDocument();
      expect(pageCheckbox).toBeChecked();
      await userEvent.click(pageCheckbox);
      expect(screen.queryByText(/selecionadas?$/)).not.toBeInTheDocument();
      await selectCards(card.name);
      await userEvent.click(screen.getByRole('checkbox', { name: `Selecionar ${card.name}` }));
      expect(screen.queryByText('1 selecionada')).not.toBeInTheDocument();
      await selectCards(card.name);
      await userEvent.click(screen.getByRole('button', { name: 'Limpar seleção' }));
      expect(screen.getByRole('checkbox', { name: `Selecionar ${card.name}` })).not.toBeChecked();
    });

    it('R10: voltar fecha o modal sem excluir e mantém a seleção', async () => {
      renderPage();
      await selectCards(card.name);
      await userEvent.click(screen.getByRole('button', { name: 'Excluir selecionadas' }));
      await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(screen.getByText('1 selecionada')).toBeInTheDocument();
      expect(catalogApi.bulkDeleteCards).not.toHaveBeenCalled();
    });
  });
});
