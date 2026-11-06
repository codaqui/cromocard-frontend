import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Category } from '../../catalog.types';
import { albumCategory, cardCategory, pageOf } from '../../test/catalogFixtures';
import { CategoryFormModal } from './CategoryFormModal';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listCategories: vi.fn(),
  },
}));

const onSaved = vi.fn();

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

async function saveAndConfirm() {
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
}

describe('CategoryFormModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.createCategory).mockReset().mockResolvedValue(cardCategory);
    vi.mocked(catalogApi.updateCategory).mockReset().mockResolvedValue(cardCategory);
    vi.mocked(catalogApi.listCategories).mockResolvedValue(pageOf([cardCategory, albumCategory]));
    onSaved.mockReset();
  });

  it('R15: cadastra a categoria com tipo e categoria pai', async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText('Nome'), 'Copa do Mundo');
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'CARD');
    await screen.findByRole('option', { name: cardCategory.name });
    await userEvent.selectOptions(screen.getByLabelText('Categoria pai'), cardCategory.id);
    await saveAndConfirm();

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith('Categoria cadastrada com sucesso.'),
    );
    expect(catalogApi.createCategory).toHaveBeenCalledWith({
      name: 'Copa do Mundo',
      type: 'CARD',
      parentCategoryId: cardCategory.id,
    });
  });

  it('R15: na edição, a categoria não aparece como pai de si mesma', async () => {
    renderModal(cardCategory);
    const parentSelect = screen.getByLabelText('Categoria pai');
    await within(parentSelect).findByRole('option', { name: albumCategory.name });

    expect(
      within(parentSelect).queryByRole('option', { name: cardCategory.name }),
    ).not.toBeInTheDocument();
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
    await saveAndConfirm();

    expect(await screen.findByRole('alert')).toHaveTextContent('A categoria pai não pode');
    expect(onSaved).not.toHaveBeenCalled();
  });
});
