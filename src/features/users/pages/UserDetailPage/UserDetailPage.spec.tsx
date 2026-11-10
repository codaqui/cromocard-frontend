import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths, userDetailPathFor } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import { formatDate } from '@/utils/formatDate';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { UsersListPage } from '../UsersListPage/UsersListPage';
import { UserDetailPage } from './UserDetailPage';

vi.mock('../../users.api', () => ({
  usersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    suspend: vi.fn(),
    reactivate: vi.fn(),
    remove: vi.fn(),
  },
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

function renderDetail(user: UserSummary) {
  vi.mocked(usersApi.getById).mockResolvedValue(user);
  return renderWithProviders({
    routes: [
      { path: paths.backoffice.users, element: <UsersListPage /> },
      { path: paths.backoffice.userDetail, element: <UserDetailPage /> },
    ],
    initialPath: userDetailPathFor(user.id),
  });
}

describe('UserDetailPage', () => {
  beforeEach(() => {
    vi.mocked(usersApi.getById).mockReset();
    vi.mocked(usersApi.update).mockReset();
    vi.mocked(usersApi.suspend).mockReset();
    vi.mocked(usersApi.reactivate).mockReset();
    vi.mocked(usersApi.remove).mockReset();
  });

  it('R4: mostra nome, e-mail, papel, status e data de cadastro', async () => {
    const user = buildUser({ role: 'SELLER', status: 'SUSPENDED' });
    renderDetail(user);

    expect(await screen.findByRole('heading', { name: user.name })).toBeInTheDocument();
    expect(screen.getByText(user.email)).toBeInTheDocument();
    expect(screen.getByText('Vendedor')).toBeInTheDocument();
    expect(screen.getByText('Suspenso')).toBeInTheDocument();
    expect(screen.getByText(formatDate(user.createdAt))).toBeInTheDocument();
  });

  it('CCD098: mostra @, telefone, CPF e último acesso', async () => {
    const user = buildUser({
      username: 'ana.colecionadora',
      phone: '11912345678',
      cpf: '52998224725',
      lastLoginAt: '2026-11-01T10:00:00.000Z',
      lastLoginIp: '189.40.12.91',
    });
    renderDetail(user);

    expect(await screen.findByText('@ana.colecionadora')).toBeInTheDocument();
    expect(screen.getByText('(11) 91234-5678')).toBeInTheDocument();
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument();
    expect(screen.getByText('189.40.12.91', { exact: false })).toBeInTheDocument();
  });

  it('CCD098: sem @, telefone, CPF ou último acesso mostra os vazios', async () => {
    const user = buildUser();
    renderDetail(user);

    await screen.findByRole('heading', { name: user.name });

    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(screen.getByText('Nunca')).toBeInTheDocument();
  });

  it('R4: a trilha de navegação leva para a lista', async () => {
    const user = buildUser();
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    await userEvent.click(screen.getByRole('link', { name: 'Usuários' }));

    expect(await screen.findByText('Nenhum usuário encontrado')).toBeInTheDocument();
  });

  it('edita o usuário e mostra o toast de atualizado', async () => {
    const user = buildUser();
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.update).mockResolvedValue({ ...user, name: 'Ana Silva' });

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.clear(within(dialog).getByLabelText('Nome'));
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Ana Silva');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Usuário atualizado com sucesso.')).toBeInTheDocument();
  });

  it('suspende o usuário ativo e mostra o toast de suspenso', async () => {
    const user = buildUser({ status: 'ACTIVE' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.suspend).mockResolvedValue({ ...user, status: 'SUSPENDED' });

    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo'), 'Violou as regras da comunidade');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspender' }));

    expect(await screen.findByText('Usuário suspenso com sucesso.')).toBeInTheDocument();
  });

  it('exclui o usuário e volta para a lista', async () => {
    const user = buildUser();
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.remove).mockResolvedValue(undefined);

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo'), 'Pedido do titular');
    await userEvent.type(
      within(dialog).getByLabelText('Digite "EXCLUIR-ANA" para confirmar'),
      'EXCLUIR-ANA',
    );
    await userEvent.click(
      within(dialog).getByLabelText(`Estou ciente de que a conta de ${user.name} será excluída`),
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Nenhum usuário encontrado')).toBeInTheDocument();
  });

  it('R4: erro ao carregar o usuário mostra o estado de erro', async () => {
    vi.mocked(usersApi.getById).mockRejectedValue(new Error('Usuário não encontrado'));
    renderWithProviders({
      routes: [{ path: paths.backoffice.userDetail, element: <UserDetailPage /> }],
      initialPath: userDetailPathFor(crypto.randomUUID()),
    });

    expect(await screen.findByText('Usuário não encontrado')).toBeInTheDocument();
  });
});
