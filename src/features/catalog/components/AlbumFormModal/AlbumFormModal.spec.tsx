import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Album } from '../../catalog.types';
import { album, albumCategory, cardCategory, categoriesByType } from '../../test/catalogFixtures';
import { AlbumFormModal } from './AlbumFormModal';

vi.mock('../../catalog.api', () => ({
  catalogApi: {
    createAlbum: vi.fn(),
    updateAlbum: vi.fn(),
    uploadImage: vi.fn(),
    listCategories: vi.fn(),
  },
}));

const onSaved = vi.fn();

function renderModal(editing?: Album) {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: <AlbumFormModal album={editing} onClose={vi.fn()} onSaved={onSaved} />,
      },
    ],
    initialPath: '/',
  });
}

async function saveAndConfirm() {
  await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
}

describe('AlbumFormModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.createAlbum).mockReset().mockResolvedValue(album);
    vi.mocked(catalogApi.updateAlbum).mockReset().mockResolvedValue(album);
    vi.mocked(catalogApi.listCategories).mockImplementation(categoriesByType);
    onSaved.mockReset();
  });

  it('R5: cadastra o álbum com o ano como número e só oferece categorias de álbum', async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText('Título'), 'Copa 2030');
    await userEvent.type(screen.getByLabelText('Ano'), '2030');
    const categorySelect = screen.getByLabelText('Categoria');
    await screen.findByRole('option', { name: albumCategory.name });
    expect(
      within(categorySelect).queryByRole('option', { name: cardCategory.name }),
    ).not.toBeInTheDocument();
    await userEvent.selectOptions(categorySelect, albumCategory.id);
    await saveAndConfirm();

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith('Álbum cadastrado com sucesso.'));
    expect(vi.mocked(catalogApi.createAlbum).mock.calls[0]?.[0]).toMatchObject({
      title: 'Copa 2030',
      year: 2030,
      categoryId: albumCategory.id,
      publisher: null,
      coverUrl: null,
    });
  });

  it('R5: recusa o álbum sem título', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Informe o título do álbum')).toBeInTheDocument();
    expect(catalogApi.createAlbum).not.toHaveBeenCalled();
  });

  it('R4: edita o álbum e mostra o motivo quando a API recusa', async () => {
    vi.mocked(catalogApi.updateAlbum).mockRejectedValue(
      new ApiError({ status: 404, code: 'ALBUM_NOT_FOUND', message: 'Álbum não encontrado' }),
    );
    renderModal(album);
    expect(screen.getByRole('dialog', { name: 'Editar álbum' })).toBeInTheDocument();
    await saveAndConfirm();

    expect(await screen.findByRole('alert')).toHaveTextContent('Álbum não encontrado');
    expect(vi.mocked(catalogApi.updateAlbum).mock.calls[0]?.[0]).toBe(album.id);
    expect(onSaved).not.toHaveBeenCalled();
  });
});
