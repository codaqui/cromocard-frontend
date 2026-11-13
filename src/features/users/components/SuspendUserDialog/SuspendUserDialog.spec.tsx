import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { SuspendUserDialog } from './SuspendUserDialog';

vi.mock('../../users.api', () => ({
  usersApi: { suspend: vi.fn(), reactivate: vi.fn() },
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
        element: <SuspendUserDialog user={user} onClose={onClose} onSaved={onSaved} />,
      },
    ],
    initialPath: paths.backoffice.users,
  });
  return { onClose, onSaved };
}

describe('SuspendUserDialog', () => {
  beforeEach(() => {
    vi.mocked(usersApi.suspend).mockReset();
    vi.mocked(usersApi.reactivate).mockReset();
  });

  it('não mostra nada sem usuário', () => {
    renderDialog(null);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('CA4: suspende um usuário ativo com o motivo', async () => {
    const user = buildUser({ status: 'ACTIVE' });
    vi.mocked(usersApi.suspend).mockResolvedValue({ ...user, status: 'SUSPENDED' });
    const { onSaved } = renderDialog(user);

    expect(screen.getByRole('alertdialog', { name: 'Suspender usuário' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Motivo'), 'Violou as regras da comunidade');
    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));

    await vi.waitFor(() =>
      expect(usersApi.suspend).toHaveBeenCalledWith(user.id, {
        reason: 'Violou as regras da comunidade',
      }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('CA5: reativa um usuário suspenso sem pedir motivo', async () => {
    const user = buildUser({ status: 'SUSPENDED' });
    vi.mocked(usersApi.reactivate).mockResolvedValue({ ...user, status: 'ACTIVE' });
    const { onSaved } = renderDialog(user);

    expect(screen.getByRole('alertdialog', { name: 'Reativar usuário' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Motivo')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reativar' }));

    await vi.waitFor(() => expect(usersApi.reactivate).toHaveBeenCalledWith(user.id));
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('cancelar fecha sem chamar a API', async () => {
    const { onClose } = renderDialog(buildUser());

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(usersApi.suspend).not.toHaveBeenCalled();
  });
});
