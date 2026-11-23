import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Category } from '../../catalog.types';
import { albumCategory, cardCategory, listedCategories } from '../../test/catalogFixtures';
import { CategoryFormModal } from './CategoryFormModal';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listCategories: vi.fn(),
  },
}));

const onSaved = vi.fn();

/** Subcategoria de carta, filha de `cardCategory`. */
const childCategory: Category = {
  ...cardCategory,
  id: '0190f3a4-0000-7000-8000-000000000005',
  name: 'Copa América',
  parentCategoryId: cardCategory.id,
  parentCategory: { id: cardCategory.id, name: cardCategory.name },
};

function renderModal(editing?: Category) {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: <CategoryFormModal category={editing} onClose={vi.fn()} onSaved={onSaved} />,
      },
    ],
    initialPath: '/',
  });
}

async function saveAndConfirm(submit = 'Cadastrar categoria') {
  await userEvent.click(screen.getByRole('button', { name: submit }));
  await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
}

const parentSelect = () => screen.getByLabelText('Categoria pai');

describe('CategoryFormModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.createCategory).mockReset().mockResolvedValue(cardCategory);
    vi.mocked(catalogApi.updateCategory).mockReset().mockResolvedValue(cardCategory);
    vi.mocked(catalogApi.listCategories).mockImplementation(listedCategories);
    onSaved.mockReset();
  });

  it('R15: cadastra a categoria com categoria pai e descrição, sem tipo (L11)', async () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Nova categoria' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nome *'), 'Copa do Mundo');
    await within(parentSelect()).findByRole('option', { name: cardCategory.name });
    await userEvent.selectOptions(parentSelect(), cardCategory.id);
    await userEvent.type(screen.getByLabelText('Descrição'), 'Seleções das copas');
    await saveAndConfirm();

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({
        title: 'Categoria cadastrada no catálogo',
        detail: 'Copa do Mundo já pode ser usada em álbuns e cartas.',
      }),
    );
    expect(catalogApi.createCategory).toHaveBeenCalledWith({
      name: 'Copa do Mundo',
      parentCategoryId: cardCategory.id,
      description: 'Seleções das copas',
      badge: null,
    });
  });

  it('CA14: oferece Nenhum, Padrão e Em alta como selo e começa em Nenhum', () => {
    renderModal();

    const select = screen.getByLabelText('Selo de exibição');
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent);

    expect(options).toEqual(['Nenhum', 'Padrão', 'Em alta']);
    expect(select).toHaveValue('');
  });

  it('CA14: envia o selo escolhido e, sem escolher, envia nulo', async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText('Nome *'), 'One Piece');
    await userEvent.selectOptions(screen.getByLabelText('Selo de exibição'), 'TRENDING');
    await saveAndConfirm();

    await vi.waitFor(() => expect(catalogApi.createCategory).toHaveBeenCalled());
    expect(catalogApi.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'One Piece', badge: 'TRENDING' }),
    );
  });

  it('CA6: mostra o slug do nome digitado, somente leitura, e explica de onde ele vem', async () => {
    renderModal();

    await userEvent.type(screen.getByLabelText('Nome *'), 'Yu-Gi-Oh! TCG');

    const slug = screen.getByLabelText('Slug');
    expect(slug).toHaveValue('yu-gi-oh-tcg');
    expect(slug).toHaveAttribute('readonly');
    expect(
      screen.getByText(
        'O slug é gerado a partir do nome. A ordem das categorias padrão fica em Configurações.',
      ),
    ).toBeInTheDocument();
  });

  it('CA6: o slug fica vazio enquanto o nome está vazio', () => {
    renderModal();

    expect(screen.getByLabelText('Slug')).toHaveValue('');
  });

  it('CA12: na edição, o slug acompanha o nome renomeado', async () => {
    renderModal(cardCategory);
    expect(screen.getByLabelText('Slug')).toHaveValue('selecoes');

    await userEvent.clear(screen.getByLabelText('Nome *'));
    await userEvent.type(screen.getByLabelText('Nome *'), 'Seleções 2026');

    expect(screen.getByLabelText('Slug')).toHaveValue('selecoes-2026');
  });

  it('CA12: na edição, mostra o slug gravado enquanto o nome não muda, mesmo com sufixo', async () => {
    renderModal({ ...cardCategory, slug: 'selecoes-2' });

    expect(screen.getByLabelText('Slug')).toHaveValue('selecoes-2');

    await userEvent.type(screen.getByLabelText('Nome *'), ' 2026');
    expect(screen.getByLabelText('Slug')).toHaveValue('selecoes-2026');
  });

  it('CA13: mostra o 409 SLUG_TAKEN no campo Nome', async () => {
    vi.mocked(catalogApi.createCategory).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'SLUG_TAKEN',
        message: 'Já existe uma categoria com um nome que gera o mesmo slug',
        details: [{ field: 'name', message: 'Já existe uma categoria com este nome' }],
      }),
    );
    renderModal();
    await userEvent.type(screen.getByLabelText('Nome *'), 'Pokemon');
    await saveAndConfirm();

    expect(await screen.findByText('Já existe uma categoria com este nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome *')).toHaveAttribute('aria-invalid', 'true');
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('L11: não há campo Tipo, e a categoria pai oferece todas as categorias', async () => {
    renderModal();

    expect(screen.queryByLabelText('Tipo *')).not.toBeInTheDocument();
    expect(parentSelect()).toBeEnabled();
    await within(parentSelect()).findByRole('option', { name: albumCategory.name });
    expect(within(parentSelect()).getByRole('option', { name: cardCategory.name })).toBeVisible();
  });

  it('R15: na edição, nem a categoria nem as subcategorias dela aparecem como pai', async () => {
    vi.mocked(catalogApi.listCategories).mockImplementation(() =>
      listedCategories().then((page) => ({ ...page, data: [...page.data, childCategory] })),
    );
    renderModal(cardCategory);
    expect(screen.getByText(`Altere os dados de ${cardCategory.name}.`)).toBeInTheDocument();
    await within(parentSelect()).findByRole('option', { name: albumCategory.name });

    const options = within(parentSelect()).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Nenhuma', albumCategory.name]);
  });

  it('R15: recusa a categoria sem nome e conta o campo no rodapé', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar categoria' }));

    expect(await screen.findByText('Informe o nome da categoria.')).toBeInTheDocument();
    expect(
      screen.getByText('Corrija o campo destacado para cadastrar a categoria.'),
    ).toBeInTheDocument();
  });

  it('R15: edita a categoria e avisa a auditoria', async () => {
    renderModal(cardCategory);
    await saveAndConfirm('Salvar alterações');

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Categoria atualizada no catálogo' }),
      ),
    );
    expect(vi.mocked(catalogApi.updateCategory).mock.calls[0]?.[0]).toBe(cardCategory.id);
  });

  it('R11: mostra o motivo quando a API recusa a categoria pai', async () => {
    vi.mocked(catalogApi.updateCategory).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'CATEGORY_PARENT_INVALID',
        message: 'A categoria pai não pode ser a própria categoria nem uma subcategoria dela',
      }),
    );
    renderModal(cardCategory);
    await saveAndConfirm('Salvar alterações');

    expect(await screen.findByRole('alert')).toHaveTextContent('A categoria pai não pode');
    expect(onSaved).not.toHaveBeenCalled();
  });
});
