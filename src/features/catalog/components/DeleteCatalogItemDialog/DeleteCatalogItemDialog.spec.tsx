import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import { album } from '../../test/catalogFixtures';
import { DeleteCatalogItemDialog } from './DeleteCatalogItemDialog';

vi.mock('../../catalog.api', () => ({ catalogApi: { deleteItem: vi.fn() } }));

const albumRef = { kind: 'album', id: album.id, name: album.title } as const;
const onDeleted = vi.fn();

function renderDialog() {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: (
          <DeleteCatalogItemDialog item={albumRef} onClose={vi.fn()} onDeleted={onDeleted} />
        ),
      },
    ],
    initialPath: '/',
  });
}

describe('DeleteCatalogItemDialog', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.deleteItem).mockReset();
    onDeleted.mockReset();
  });

  it('CA4: álbum sem cartas é excluído e a tela confirma', async () => {
    vi.mocked(catalogApi.deleteItem).mockResolvedValue(undefined);
    renderDialog();

    expect(screen.getByText('Excluir "Copa 2026" do catálogo?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalledWith('Álbum excluído com sucesso.'));
    expect(catalogApi.deleteItem).toHaveBeenCalledWith('album', album.id);
  });

  it('CA4/R11: álbum com cartas não é excluído e o diálogo mostra o motivo do 422', async () => {
    vi.mocked(catalogApi.deleteItem).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'ALBUM_HAS_CARDS',
        message: 'O álbum tem cartas cadastradas e não pode ser excluído',
      }),
    );
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O álbum tem cartas cadastradas e não pode ser excluído',
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
