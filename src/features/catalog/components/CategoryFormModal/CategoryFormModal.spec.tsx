import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Category } from '../../catalog.types';
import { albumCategory, cardCategory, categoriesByType } from '../../test/catalogFixtures';
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
    vi.mocked(catalogApi.listCategories).mockImplementation(categoriesByType);
    onSaved.mockReset();
  });

  it('R15: cadastra a categoria com tipo, categoria pai e descrição', async () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Nova categoria' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nome *'), 'Copa do Mundo');
    await userEvent.selectOptions(screen.getByLabelText('Tipo *'), 'CARD');
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
      type: 'CARD',
      parentCategoryId: cardCategory.id,
      description: 'Seleções das copas',
    });
  });

  it('R15: sem tipo escolhido, a categoria pai fica bloqueada', () => {
    renderModal();

    expect(parentSelect()).toBeDisabled();
    expect(within(parentSelect()).getByRole('option')).toHaveTextContent('Escolha o tipo primeiro');
  });

  it('L9: a categoria pai só oferece categorias do mesmo tipo', async () => {
    renderModal();
    await userEvent.selectOptions(screen.getByLabelText('Tipo *'), 'ALBUM');

    await within(parentSelect()).findByRole('option', { name: albumCategory.name });
    expect(
      within(parentSelect()).queryByRole('option', { name: cardCategory.name }),
    ).not.toBeInTheDocument();
  });

  it('L9: trocar o tipo limpa a categoria pai escolhida', async () => {
    renderModal();
    await userEvent.selectOptions(screen.getByLabelText('Tipo *'), 'CARD');
    await within(parentSelect()).findByRole('option', { name: cardCategory.name });
    await userEvent.selectOptions(parentSelect(), cardCategory.id);

    await userEvent.selectOptions(screen.getByLabelText('Tipo *'), 'ALBUM');

    expect(parentSelect()).toHaveValue('');
  });

  it('R15: na edição, nem a categoria nem as subcategorias dela aparecem como pai', async () => {
    vi.mocked(catalogApi.listCategories).mockImplementation((params) =>
      categoriesByType(params).then((page) => ({ ...page, data: [...page.data, childCategory] })),
    );
    renderModal(cardCategory);
    expect(screen.getByText(`Altere os dados de ${cardCategory.name}.`)).toBeInTheDocument();
    await vi.waitFor(() => expect(parentSelect()).toBeEnabled());

    const options = within(parentSelect()).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Nenhuma']);
  });

  it('R15: recusa a categoria sem nome e sem tipo e conta os campos no rodapé', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar categoria' }));

    expect(await screen.findByText('Informe o nome da categoria.')).toBeInTheDocument();
    expect(screen.getByText('Escolha o tipo da categoria.')).toBeInTheDocument();
    expect(
      screen.getByText('Corrija os 2 campos destacados para cadastrar a categoria.'),
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
