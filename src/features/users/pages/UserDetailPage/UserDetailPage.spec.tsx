import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths, userDetailPathFor } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticatedUser } from '@/types/authenticated-user';
import { formatDate } from '@/utils/formatDate';

import { usersApi } from '../../users.api';
import type { UserDetail } from '../../users.types';
import { UsersListPage } from '../UsersListPage/UsersListPage';
import { UserDetailPage } from './UserDetailPage';

vi.mock('../../users.api', () => ({
  usersApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    suspend: vi.fn(),
    reactivate: vi.fn(),
    remove: vi.fn(),
    resendActivation: vi.fn(),
  },
}));

function buildUser(overrides: Partial<UserDetail> = {}): UserDetail {
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
    oauthProvider: null,
    addresses: [],
    adminActions: [],
    ...overrides,
  };
}

function renderDetail(user: UserDetail, currentUser: AuthenticatedUser | null = null) {
  vi.mocked(usersApi.getById).mockResolvedValue(user);
  return renderWithProviders({
    routes: [
      { path: paths.backoffice.users, element: <UsersListPage /> },
      { path: paths.backoffice.userDetail, element: <UserDetailPage /> },
    ],
    initialPath: userDetailPathFor(user.id),
    user: currentUser,
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
    expect(screen.getAllByText('Suspenso').length).toBeGreaterThan(0);
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

  it('reativa o usuário suspenso sem pedir motivo', async () => {
    const user = buildUser({ status: 'SUSPENDED' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.reactivate).mockResolvedValue({ ...user, status: 'ACTIVE' });

    await userEvent.click(screen.getByRole('button', { name: 'Reativar' }));
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).queryByLabelText('Motivo')).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reativar' }));

    expect(usersApi.reactivate).toHaveBeenCalledWith(user.id);
    expect(await screen.findByText('Usuário reativado com sucesso.')).toBeInTheDocument();
  });

  it('R15 (CCD098): editar um usuário que não ativou a conta oferece reenviar o link', async () => {
    const user = buildUser({ emailVerified: false });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });
    vi.mocked(usersApi.update).mockResolvedValue(user);
    vi.mocked(usersApi.resendActivation).mockResolvedValue(undefined);

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    const dialog = screen.getByRole('dialog');
    const checkbox = within(dialog).getByLabelText('Reenviar link de ativação');
    expect(checkbox).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(vi.mocked(usersApi.resendActivation).mock.calls[0]?.[0]).toBe(user.id);
    expect(await screen.findByText('Usuário atualizado com sucesso.')).toBeInTheDocument();
  });

  it('editar um usuário que já ativou a conta não mostra reenviar o link', async () => {
    const user = buildUser({ emailVerified: true });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(
      within(screen.getByRole('dialog')).queryByLabelText('Reenviar link de ativação'),
    ).not.toBeInTheDocument();
  });

  it('CA10: mostra os endereços e as ações administrativas do usuário', async () => {
    const user = buildUser({
      addresses: [
        {
          id: crypto.randomUUID(),
          label: 'Casa',
          zipCode: '01310-100',
          street: 'Av. Paulista',
          number: '1000',
          complement: null,
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          isPrimary: true,
        },
      ],
      adminActions: [
        {
          id: crypto.randomUUID(),
          action: 'USER_SUSPENDED',
          reason: 'Violou as regras da comunidade',
          admin: { id: crypto.randomUUID(), name: 'Arthur Valadares' },
          createdAt: '2026-11-11T16:20:00.000Z',
        },
      ],
    });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByText(/Av\. Paulista, 1000/)).toBeInTheDocument();
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getByText('Usuário suspenso')).toBeInTheDocument();
    expect(
      screen.getByText(/Arthur Valadares · Violou as regras da comunidade/),
    ).toBeInTheDocument();
  });

  it('CA10: sem endereços nem ações administrativas, mostra os estados vazios', async () => {
    const user = buildUser();
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByText('Nenhum endereço cadastrado.')).toBeInTheDocument();
    expect(screen.getByText('Nenhuma ação registrada.')).toBeInTheDocument();
  });

  it('CA11: mostra "Membro desde", o status em destaque e o método de autenticação', async () => {
    const user = buildUser({ createdAt: '2026-03-15T00:00:00.000Z', oauthProvider: 'google' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByText('Membro desde: Março de 2026')).toBeInTheDocument();
    expect(screen.getByText('Login com Google')).toBeInTheDocument();
  });

  it('CA11: sem provedor OAuth, a autenticação é por e-mail e senha', async () => {
    const user = buildUser({ oauthProvider: null });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByText('E-mail e senha')).toBeInTheDocument();
  });

  it('CA11: provedor OAuth que não é Google mostra o nome do provedor', async () => {
    const user = buildUser({ oauthProvider: 'facebook' });
    renderDetail(user);
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByText('Login com facebook')).toBeInTheDocument();
  });

  it('CA11: na própria conta, suspender e excluir ficam indisponíveis', async () => {
    const user = buildUser({ role: 'ADMIN' });
    renderDetail(user, { id: user.id, role: 'ADMIN' });
    await screen.findByRole('heading', { name: user.name });

    expect(screen.getByRole('button', { name: 'Suspender' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();
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
