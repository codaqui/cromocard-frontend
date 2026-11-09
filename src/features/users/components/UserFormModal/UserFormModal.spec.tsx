import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { UserFormModal } from './UserFormModal';

vi.mock('../../users.api', () => ({
  usersApi: { create: vi.fn(), update: vi.fn() },
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
    ...overrides,
  };
}

function renderModal(user: UserSummary | null, onClose = vi.fn(), onSaved = vi.fn()) {
  renderWithProviders({
    routes: [
      {
        path: paths.backoffice.users,
        element: <UserFormModal open user={user} onClose={onClose} onSaved={onSaved} />,
      },
    ],
    initialPath: paths.backoffice.users,
  });
  return { onClose, onSaved };
}

async function fillIdentity(name: string, email: string) {
  await userEvent.clear(screen.getByLabelText('Nome'));
  await userEvent.type(screen.getByLabelText('Nome'), name);
  await userEvent.clear(screen.getByLabelText('E-mail'));
  await userEvent.type(screen.getByLabelText('E-mail'), email);
}

describe('UserFormModal', () => {
  beforeEach(() => {
    vi.mocked(usersApi.create).mockReset();
    vi.mocked(usersApi.update).mockReset();
  });

  it('CA2: cria o usuário com nome, e-mail e papel', async () => {
    vi.mocked(usersApi.create).mockResolvedValue(buildUser({ role: 'SELLER' }));
    const { onSaved } = renderModal(null);

    await fillIdentity('Bia Vendedora', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() =>
      expect(usersApi.create).toHaveBeenCalledWith(
        { name: 'Bia Vendedora', email: 'bia@cromocard.dev', role: 'SELLER' },
        expect.anything(),
      ),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('CA3: edita um usuário existente', async () => {
    const user = buildUser();
    vi.mocked(usersApi.update).mockResolvedValue({ ...user, name: 'Ana Silva' });
    const { onSaved } = renderModal(user);

    expect(screen.getByLabelText('Nome')).toHaveValue(user.name);
    await userEvent.clear(screen.getByLabelText('Nome'));
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await vi.waitFor(() =>
      expect(usersApi.update).toHaveBeenCalledWith(user.id, {
        name: 'Ana Silva',
        email: user.email,
        role: user.role,
      }),
    );
    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('mostra o erro por campo quando a API responde 409 no e-mail', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'EMAIL_ALREADY_REGISTERED',
        message: 'Já existe um usuário cadastrado com este e-mail',
        details: [{ field: 'email', message: 'Já existe um usuário cadastrado com este e-mail' }],
      }),
    );
    renderModal(null);

    await fillIdentity('Bia', 'bia@cromocard.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(
      await screen.findByText('Já existe um usuário cadastrado com este e-mail'),
    ).toBeInTheDocument();
  });

  it('R11: mostra o erro por campo no 400 e permite corrigir e reenviar', async () => {
    vi.mocked(usersApi.create)
      .mockRejectedValueOnce(
        new ApiError({
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: [{ field: 'email', message: 'Domínio de e-mail não permitido' }],
        }),
      )
      .mockResolvedValueOnce(buildUser({ email: 'bia@gmail.com', role: 'SELLER' }));
    const { onSaved } = renderModal(null);

    await fillIdentity('Bia', 'bia@dominio-bloqueado.dev');
    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'SELLER');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByText('Domínio de e-mail não permitido')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('E-mail'));
    await userEvent.type(screen.getByLabelText('E-mail'), 'bia@gmail.com');
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it('CA8: cancelar fecha sem gravar', async () => {
    const { onClose } = renderModal(null);

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(usersApi.create).not.toHaveBeenCalled();
  });
});
