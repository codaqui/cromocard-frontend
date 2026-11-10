import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { DeleteUserDialog } from './DeleteUserDialog';

vi.mock('../../users.api', () => ({
  usersApi: { remove: vi.fn() },
}));

function buildUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: crypto.randomUUID(),
    name: 'Ana Colecionadora',
    email: 'ana@cromocard.dev',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    username: null,
    phone: null,
    cpf: null,
    lastLoginAt: null,
    lastLoginIp: null,
    ...overrides,
  };
}

function renderDialog(user: UserSummary | null, onClose = vi.fn(), onSaved = vi.fn()) {
  renderWithProviders({
    routes: [
      {
        path: paths.backoffice.users,
        element: <DeleteUserDialog user={user} onClose={onClose} onSaved={onSaved} />,
      },
    ],
    initialPath: paths.backoffice.users,
  });
  return { onClose, onSaved };
}

describe('DeleteUserDialog', () => {
  beforeEach(() => {
    vi.mocked(usersApi.remove).mockReset();
  });

  it('não mostra nada sem usuário', () => {
    renderDialog(null);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('mostra o texto de soft delete, não de exclusão definitiva', () => {
    renderDialog(buildUser({ name: 'Ana Colecionadora' }));

    expect(
      screen.getByText(
        'A conta de Ana Colecionadora será excluída e pode ser restaurada depois, se for preciso.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/definitivamente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/irrevers/i)).not.toBeInTheDocument();
  });

  it('exige digitar o texto de confirmação e o motivo antes de confirmar', async () => {
    const user = buildUser({ name: 'Ana Colecionadora' });
    renderDialog(user);

    await userEvent.click(
      screen.getByLabelText('Estou ciente de que a conta de Ana Colecionadora será excluída'),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('O texto digitado não confere')).toBeInTheDocument();
    expect(usersApi.remove).not.toHaveBeenCalled();
  });

  it('exige marcar "Estou ciente" antes de confirmar', async () => {
    const user = buildUser({ name: 'Ana Colecionadora' });
    renderDialog(user);

    await userEvent.type(
      screen.getByLabelText('Digite "EXCLUIR-ANA" para confirmar'),
      'EXCLUIR-ANA',
    );
    await userEvent.type(screen.getByLabelText('Motivo'), 'Pedido do titular');
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(
      await screen.findByText('Marque que está ciente da exclusão antes de confirmar'),
    ).toBeInTheDocument();
    expect(usersApi.remove).not.toHaveBeenCalled();
  });

  it('CA6: exclui com o texto de confirmação, o motivo e "Estou ciente" marcado', async () => {
    const user = buildUser({ name: 'Ana Colecionadora' });
    vi.mocked(usersApi.remove).mockResolvedValue(undefined);
    const { onSaved } = renderDialog(user);

    await userEvent.type(
      screen.getByLabelText('Digite "EXCLUIR-ANA" para confirmar'),
      'EXCLUIR-ANA',
    );
    await userEvent.type(screen.getByLabelText('Motivo'), 'Pedido do titular');
    await userEvent.click(
      screen.getByLabelText('Estou ciente de que a conta de Ana Colecionadora será excluída'),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await vi.waitFor(() =>
      expect(usersApi.remove).toHaveBeenCalledWith(user.id, { reason: 'Pedido do titular' }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('cancelar fecha sem chamar a API', async () => {
    const { onClose } = renderDialog(buildUser());

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(usersApi.remove).not.toHaveBeenCalled();
  });
});
