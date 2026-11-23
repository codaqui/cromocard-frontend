import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { Album } from '../../catalog.types';
import { album, albumCategory, cardCategory, listedCategories } from '../../test/catalogFixtures';
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

async function saveAndConfirm(submit = 'Cadastrar álbum') {
  await userEvent.click(screen.getByRole('button', { name: submit }));
  await userEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));
}

describe('AlbumFormModal', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.createAlbum).mockReset().mockResolvedValue(album);
    vi.mocked(catalogApi.updateAlbum).mockReset().mockResolvedValue(album);
    vi.mocked(catalogApi.listCategories).mockImplementation(listedCategories);
    onSaved.mockReset();
  });

  it('R5, L11: cadastra o álbum com o ano como número e oferece todas as franquias', async () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Novo álbum' })).toBeInTheDocument();
    expect(
      screen.getByText('O total de cartas é calculado pelas cartas do álbum.'),
    ).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Título *'), 'Copa 2030');
    await userEvent.type(screen.getByLabelText('Ano'), '2030');
    const categorySelect = screen.getByLabelText('Franquia');
    await screen.findByRole('option', { name: albumCategory.name });
    expect(within(categorySelect).getByRole('option', { name: cardCategory.name })).toBeVisible();
    await userEvent.selectOptions(categorySelect, albumCategory.id);
    await saveAndConfirm();

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({
        title: 'Álbum cadastrado no catálogo',
        detail: 'Copa 2030 já aparece na lista de álbuns.',
      }),
    );
    expect(vi.mocked(catalogApi.createAlbum).mock.calls[0]?.[0]).toMatchObject({
      title: 'Copa 2030',
      year: 2030,
      categoryId: albumCategory.id,
      publisher: null,
      coverUrl: null,
      status: 'ACTIVE',
    });
  });

  it('R5: cadastra o álbum inativo', async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText('Título *'), 'Copa 1950');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'INACTIVE');
    await saveAndConfirm();

    await vi.waitFor(() =>
      expect(vi.mocked(catalogApi.createAlbum).mock.calls[0]?.[0]).toMatchObject({
        status: 'INACTIVE',
      }),
    );
  });

  it('R5: recusa o álbum sem título', async () => {
    renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar álbum' }));

    expect(await screen.findByText('Informe o título do álbum.')).toBeInTheDocument();
    expect(
      screen.getByText('Corrija o campo destacado para cadastrar o álbum.'),
    ).toBeInTheDocument();
    expect(catalogApi.createAlbum).not.toHaveBeenCalled();
  });

  it('R4: edita o álbum e avisa a auditoria', async () => {
    renderModal(album);
    await saveAndConfirm('Salvar alterações');

    await vi.waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({
        title: 'Álbum atualizado no catálogo',
        detail: 'Copa 2026: Alterações registradas no log de auditoria.',
      }),
    );
  });

  it('R4: edita o álbum e mostra o motivo quando a API recusa', async () => {
    vi.mocked(catalogApi.updateAlbum).mockRejectedValue(
      new ApiError({ status: 404, code: 'ALBUM_NOT_FOUND', message: 'Álbum não encontrado' }),
    );
    renderModal(album);
    expect(screen.getByRole('dialog', { name: 'Editar álbum' })).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toHaveValue('ACTIVE');
    await saveAndConfirm('Salvar alterações');

    expect(await screen.findByRole('alert')).toHaveTextContent('Álbum não encontrado');
    expect(vi.mocked(catalogApi.updateAlbum).mock.calls[0]?.[0]).toBe(album.id);
    expect(onSaved).not.toHaveBeenCalled();
  });
});
