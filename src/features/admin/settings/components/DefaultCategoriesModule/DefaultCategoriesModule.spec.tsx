import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { settingsApi } from '../../settings.api';
import { settingsNotices } from '../../settings.labels';
import { categoryOption, defaultCategory } from '../../test/fixtures';
import { imageFile, renderSettings } from '../../test/renderSettings';
import { DefaultCategoriesModule } from './DefaultCategoriesModule';

vi.mock('../../settings.api', () => ({
  settingsApi: {
    listDefaultCategories: vi.fn(),
    updateDefaultCategories: vi.fn(),
    listCategoryOptions: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

const BACK_URL = 'https://hml-api.cromocard.com.br/uploads/cards/verso-pokemon.png';
const POKEMON = defaultCategory('c-pokemon', 'Pokémon', { backImageUrl: BACK_URL });
const MAGIC = defaultCategory('c-magic', 'Magic: The Gathering');
const option = categoryOption;

function renderCategories() {
  const notify = vi.fn();
  renderSettings(<DefaultCategoriesModule notify={notify} />);
  return { notify, user: userEvent.setup() };
}

const saveButton = () => screen.getByRole('button', { name: /Salvar categorias/ });

beforeEach(() => {
  vi.mocked(settingsApi.listDefaultCategories).mockReset().mockResolvedValue([POKEMON, MAGIC]);
  vi.mocked(settingsApi.updateDefaultCategories).mockReset();
  vi.mocked(settingsApi.uploadImage).mockReset();
  vi.mocked(settingsApi.listCategoryOptions).mockResolvedValue({
    data: [
      option('c-pokemon', 'Pokémon'),
      option('c-futebol', 'Futebol'),
      option('c-sub', 'Copa 2026', 'c-futebol'),
    ],
    meta: { page: 1, pageSize: 100, total: 3, totalPages: 1 },
  });
});

describe('DefaultCategoriesModule', () => {
  it('R17: lista as categorias padrão com "Trocar verso" e "Enviar verso"', async () => {
    renderCategories();

    expect(await screen.findByText('Pokémon')).toBeInTheDocument();
    expect(screen.getByLabelText('Trocar verso de Pokémon')).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar verso de Magic: The Gathering')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gerenciar categorias no Catálogo' })).toHaveAttribute(
      'href',
      '/backoffice/catalog',
    );
  });

  it('CA4: adiciona uma franquia, remove outra e salva só as duas que ficaram', async () => {
    vi.mocked(settingsApi.updateDefaultCategories).mockResolvedValue([POKEMON]);
    const { notify, user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));
    const picker = screen.getByRole('dialog');
    await user.click(await within(picker).findByRole('button', { name: 'Adicionar Futebol' }));
    await user.click(
      screen.getByRole('button', { name: 'Remover Magic: The Gathering das categorias padrão' }),
    );
    await user.click(saveButton());

    await waitFor(() => expect(notify).toHaveBeenCalledWith(settingsNotices.defaultCategories));
    expect(vi.mocked(settingsApi.updateDefaultCategories).mock.calls[0]?.[0]).toEqual([
      { id: 'c-pokemon', backImageUrl: BACK_URL, isPinned: false },
      { id: 'c-futebol', backImageUrl: null, isPinned: false },
    ]);
  });

  it('L9: o diálogo só oferece franquias que ainda não são padrão', async () => {
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));
    const picker = screen.getByRole('dialog');

    expect(await within(picker).findByText('Futebol')).toBeInTheDocument();
    expect(within(picker).queryByText('Pokémon')).not.toBeInTheDocument();
    expect(within(picker).queryByText('Copa 2026')).not.toBeInTheDocument();
    await user.type(within(picker).getByRole('textbox', { name: 'Buscar franquia' }), 'fut');
    await waitFor(() =>
      expect(settingsApi.listCategoryOptions).toHaveBeenLastCalledWith({
        q: 'fut',
        page: 1,
        pageSize: 100,
      }),
    );
  });

  it('CA10: envia o verso na pasta cards e grava junto com as categorias', async () => {
    const uploaded = 'https://hml-api.cromocard.com.br/uploads/cards/verso-magic.png';
    vi.mocked(settingsApi.uploadImage).mockResolvedValue({ key: 'k', url: uploaded });
    vi.mocked(settingsApi.updateDefaultCategories).mockResolvedValue([POKEMON, MAGIC]);
    const { user } = renderCategories();

    await user.upload(
      await screen.findByLabelText('Enviar verso de Magic: The Gathering'),
      imageFile('verso.png', 'image/png'),
    );
    expect(
      await screen.findByLabelText('Trocar verso de Magic: The Gathering'),
    ).toBeInTheDocument();
    await user.click(saveButton());

    await waitFor(() =>
      expect(vi.mocked(settingsApi.updateDefaultCategories).mock.calls[0]?.[0]).toEqual([
        { id: 'c-pokemon', backImageUrl: BACK_URL, isPinned: false },
        { id: 'c-magic', backImageUrl: uploaded, isPinned: false },
      ]),
    );
    expect(settingsApi.uploadImage).toHaveBeenCalledWith('cards', expect.any(File));
  });

  it('R12: verso fora de PNG, JPG ou WEBP vira aviso e não é enviado', async () => {
    const { notify } = renderCategories();
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(
      await screen.findByLabelText('Trocar verso de Pokémon'),
      imageFile('verso.gif', 'image/gif'),
    );

    expect(notify).toHaveBeenCalledWith({
      message: 'Não foi possível enviar a imagem',
      detail: 'Envie uma imagem PNG, JPG ou WEBP',
      tone: 'danger',
    });
    expect(settingsApi.uploadImage).not.toHaveBeenCalled();
  });

  it('CA5: Cancelar volta o conjunto carregado', async () => {
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: 'Remover Pokémon das categorias padrão' }));
    expect(screen.queryByText('Pokémon')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByText('Pokémon')).toBeInTheDocument();
  });

  it('CA4: categoria com pai recusada pela API vira aviso de erro', async () => {
    const error = new ApiError({
      status: 422,
      code: 'DEFAULT_CATEGORY_NOT_ROOT',
      message: 'Só uma franquia, sem categoria pai, pode ser categoria padrão',
    });
    vi.mocked(settingsApi.updateDefaultCategories).mockRejectedValue(error);
    const { notify, user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(saveButton());

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'danger', detail: error.message }),
      ),
    );
  });

  it('R3: mostra o erro quando as categorias padrão não carregam', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockRejectedValue(new Error('Sem conexão'));
    renderCategories();

    expect(
      await screen.findByText('Não foi possível carregar as categorias padrão'),
    ).toBeInTheDocument();
  });

  it('R10: sem categorias padrão, convida a adicionar', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue([]);
    renderCategories();

    expect(await screen.findByText(/Nenhuma categoria padrão/)).toBeInTheDocument();
  });

  it('L9: fechar o diálogo não adiciona nada', async () => {
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('L9: erro ao buscar as franquias aparece no diálogo', async () => {
    vi.mocked(settingsApi.listCategoryOptions).mockRejectedValue(new Error('Catálogo fora do ar'));
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));

    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
      'Catálogo fora do ar',
    );
  });

  it('R12: falha no envio do verso vira aviso e mostra Enviando… enquanto sobe', async () => {
    let reject: (error: Error) => void = () => undefined;
    vi.mocked(settingsApi.uploadImage).mockReturnValue(new Promise((_, fail) => (reject = fail)));
    const { notify, user } = renderCategories();

    await user.upload(
      await screen.findByLabelText('Trocar verso de Pokémon'),
      imageFile('v.png', 'image/png'),
    );
    expect(await screen.findByLabelText('Enviando… de Pokémon')).toBeDisabled();
    reject(new Error('Storage indisponível'));

    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith({
        message: 'Não foi possível enviar a imagem',
        detail: 'Storage indisponível',
        tone: 'danger',
      }),
    );
  });

  it('R12: fechar a janela de arquivo sem escolher nada não envia o verso', async () => {
    renderCategories();

    fireEvent.change(await screen.findByLabelText('Trocar verso de Pokémon'), {
      target: { files: [] },
    });

    expect(settingsApi.uploadImage).not.toHaveBeenCalled();
  });
  it('L9: sem franquia disponível, o diálogo avisa', async () => {
    vi.mocked(settingsApi.listCategoryOptions).mockResolvedValue({
      data: [option('c-pokemon', 'Pokémon'), option('c-sub', 'Copa 2026', 'c-futebol')],
      meta: { page: 1, pageSize: 100, total: 2, totalPages: 1 },
    });
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));

    expect(
      await within(screen.getByRole('dialog')).findByText('Nenhuma franquia encontrada.'),
    ).toBeInTheDocument();
  });
  it('L9: Carregar mais traz a próxima página de franquias', async () => {
    vi.mocked(settingsApi.listCategoryOptions)
      .mockResolvedValueOnce({
        data: [option('c-sub', 'Copa 2026', 'c-futebol')],
        meta: { page: 1, pageSize: 100, total: 101, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        data: [option('c-onepiece', 'One Piece')],
        meta: { page: 2, pageSize: 100, total: 101, totalPages: 2 },
      });
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));
    const picker = screen.getByRole('dialog');
    await user.click(await within(picker).findByRole('button', { name: 'Carregar mais' }));

    expect(await within(picker).findByText('One Piece')).toBeInTheDocument();
    expect(within(picker).queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument();
  });

  it('R10: com 50 categorias padrão, não deixa adicionar outra', async () => {
    const fifty = Array.from({ length: 50 }, (_, index) =>
      defaultCategory(`c-${index}`, `Franquia ${index}`),
    );
    vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue(fifty);
    renderCategories();

    const add = await screen.findByRole('button', { name: /Adicionar categoria padrão/ });

    expect(add).toBeDisabled();
    expect(add).toHaveAttribute('title', expect.stringContaining('Limite de 50 categorias padrão'));
  });
  it('L9: Carregar mais fica desabilitado enquanto a página chega', async () => {
    vi.mocked(settingsApi.listCategoryOptions)
      .mockResolvedValueOnce({
        data: [option('c-sub', 'Copa 2026', 'c-futebol')],
        meta: { page: 1, pageSize: 100, total: 101, totalPages: 2 },
      })
      .mockReturnValueOnce(new Promise(() => undefined));
    const { user } = renderCategories();
    await screen.findByText('Pokémon');

    await user.click(screen.getByRole('button', { name: /Adicionar categoria padrão/ }));
    const picker = screen.getByRole('dialog');
    await user.click(await within(picker).findByRole('button', { name: 'Carregar mais' }));

    expect(await within(picker).findByRole('button', { name: 'Carregando…' })).toBeDisabled();
  });

  it('CA5: o rascunho continua quando a lista é buscada de novo com o mesmo conjunto', async () => {
    vi.mocked(settingsApi.updateDefaultCategories).mockResolvedValue([POKEMON]);
    const queryClient = renderSettings(<DefaultCategoriesModule notify={vi.fn()} />);
    const user = userEvent.setup();
    await screen.findByText('Magic: The Gathering');

    await user.click(
      screen.getByRole('button', { name: 'Remover Magic: The Gathering das categorias padrão' }),
    );
    await queryClient.refetchQueries();
    await waitFor(() => expect(settingsApi.listDefaultCategories).toHaveBeenCalledTimes(2));

    expect(screen.queryByText('Magic: The Gathering')).not.toBeInTheDocument();
    await user.click(saveButton());
    await waitFor(() =>
      expect(vi.mocked(settingsApi.updateDefaultCategories).mock.calls[0]?.[0]).toEqual([
        { id: 'c-pokemon', backImageUrl: BACK_URL, isPinned: false },
      ]),
    );
  });
});
