import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
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
    resendActivation: vi.fn(),
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
    vi.mocked(usersApi.resendActivation).mockReset();
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

  it('nome de uma só palavra mostra só a primeira letra no avatar', async () => {
    const user = buildUser({ name: 'Madonna' });
    renderDetail(user);

    expect(await screen.findByRole('heading', { name: 'Madonna' })).toBeInTheDocument();
    expect(screen.getByText('M', { selector: 'span' })).toBeInTheDocument();
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
    expect(screen.getByText('+55 (11) 91234-5678')).toBeInTheDocument();
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
    await userEvent.clear(within(dialog).getByLabelText('Nome completo'));
    await userEvent.type(within(dialog).getByLabelText('Nome completo'), 'Ana Silva');
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

  it('fecha o toast de sucesso pelo botão de fechar', async () => {
    const user = buildUser({ status: 'ACTIVE' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.suspend).mockResolvedValue({ ...user, status: 'SUSPENDED' });

    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo'), 'Violou as regras da comunidade');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspender' }));
    await screen.findByText('Usuário suspenso com sucesso.');

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByText('Usuário suspenso com sucesso.')).not.toBeInTheDocument();
  });

  it('cancelar a suspensão fecha o diálogo sem chamar a API', async () => {
    const user = buildUser({ status: 'ACTIVE' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    await userEvent.click(screen.getByRole('button', { name: 'Suspender' }));
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }),
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(usersApi.suspend).not.toHaveBeenCalled();
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

  it('R15: sem nunca ter acessado, oferece reenviar o link de ativação', async () => {
    const user = buildUser({ lastLoginAt: null });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByRole('button', { name: 'Reenviar link de ativação' })).toBeInTheDocument();
  });

  it('já tendo acessado, não oferece reenviar o link de ativação', async () => {
    const user = buildUser({ lastLoginAt: '2026-11-01T10:00:00.000Z' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(
      screen.queryByRole('button', { name: 'Reenviar link de ativação' }),
    ).not.toBeInTheDocument();
  });

  it('CA8 (CCD098): reenvia o link e mostra o toast de sucesso', async () => {
    const user = buildUser({ lastLoginAt: null });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.resendActivation).mockResolvedValue(undefined);

    await userEvent.click(screen.getByRole('button', { name: 'Reenviar link de ativação' }));

    expect(vi.mocked(usersApi.resendActivation).mock.calls[0]?.[0]).toBe(user.id);
    expect(await screen.findByText('Link de ativação reenviado com sucesso.')).toBeInTheDocument();
  });

  it('CA8 (CCD098): mostra o erro da API quando a conta já foi ativada', async () => {
    const user = buildUser({ lastLoginAt: null });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.resendActivation).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'ALREADY_ACTIVATED',
        message: 'Esta conta já foi ativada',
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Reenviar link de ativação' }));

    expect(await screen.findByText('Esta conta já foi ativada')).toBeInTheDocument();
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
