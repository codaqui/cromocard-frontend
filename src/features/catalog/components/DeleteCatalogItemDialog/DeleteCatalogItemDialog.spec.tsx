import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { renderWithProviders } from '@/test/renderWithProviders';

import { catalogApi } from '../../catalog.api';
import type { CatalogItemRef } from '../../catalog.types';
import { album, card } from '../../test/catalogFixtures';
import { DeleteCatalogItemDialog } from './DeleteCatalogItemDialog';

vi.mock('../../catalog.api', () => ({ catalogApi: { deleteItem: vi.fn() } }));

const albumRef: CatalogItemRef = { kind: 'album', id: album.id, name: album.title };
const onDeleted = vi.fn();
const onClose = vi.fn();

function renderDialog(item = albumRef) {
  renderWithProviders({
    routes: [
      {
        path: '/',
        element: <DeleteCatalogItemDialog item={item} onClose={onClose} onDeleted={onDeleted} />,
      },
    ],
    initialPath: '/',
  });
}

describe('DeleteCatalogItemDialog', () => {
  beforeEach(() => {
    vi.mocked(catalogApi.deleteItem).mockReset();
    onDeleted.mockReset();
    onClose.mockReset();
  });

  it('CA4: álbum sem cartas é excluído e a tela confirma', async () => {
    vi.mocked(catalogApi.deleteItem).mockResolvedValue(undefined);
    renderDialog();

    expect(screen.getByText('Excluir "Copa 2026" do catálogo?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await vi.waitFor(() =>
      expect(onDeleted).toHaveBeenCalledWith({
        title: 'Álbum excluído do catálogo',
        detail: 'Copa 2026 saiu das buscas.',
      }),
    );
    expect(catalogApi.deleteItem).toHaveBeenCalledWith('album', album.id);
  });

  it('CA4/R11: álbum com cartas não é excluído e o modal explica o motivo', async () => {
    vi.mocked(catalogApi.deleteItem).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'ALBUM_HAS_CARDS',
        message: 'O álbum tem cartas cadastradas e não pode ser excluído',
      }),
    );
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    const blocked = await screen.findByRole('alertdialog', {
      name: 'Não é possível excluir este álbum',
    });
    expect(blocked).toHaveTextContent('Copa 2026 tem cartas cadastradas.');
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('R11: carta usada em coleções mostra "Não é possível excluir esta carta" e fecha no Entendi', async () => {
    vi.mocked(catalogApi.deleteItem).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'CARD_IN_USE',
        message: 'A carta já está em coleções e não pode ser excluída',
      }),
    );
    renderDialog({ kind: 'card', id: card.id, name: card.name });
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(
      await screen.findByRole('alertdialog', { name: 'Não é possível excluir esta carta' }),
    ).toHaveTextContent(
      'Pelé está em coleções de usuários. Uma carta usada em coleções não pode ser excluída do catálogo.',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Entendi' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('R11: erro que não é de vínculo continua no diálogo de confirmação', async () => {
    vi.mocked(catalogApi.deleteItem).mockRejectedValue(
      new ApiError({ status: 404, code: 'ALBUM_NOT_FOUND', message: 'Álbum não encontrado' }),
    );
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Álbum não encontrado');
    expect(screen.queryByRole('button', { name: 'Entendi' })).not.toBeInTheDocument();
  });
});
