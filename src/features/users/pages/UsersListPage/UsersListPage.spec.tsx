import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { UsersListPage } from './UsersListPage';

vi.mock('../../users.api', () => ({
  usersApi: {
    list: vi.fn(),
    create: vi.fn(),
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

function mockList(users: UserSummary[]) {
  vi.mocked(usersApi.list).mockResolvedValue({
    data: users,
    meta: { page: 1, pageSize: 20, total: users.length, totalPages: 1 },
  });
}

function renderPage() {
  renderWithProviders({
    routes: [
      { path: paths.backoffice.users, element: <UsersListPage /> },
      { path: paths.backoffice.userDetail, element: <div>Tela de detalhe</div> },
    ],
    initialPath: paths.backoffice.users,
  });
}

function lastListCall() {
  return vi.mocked(usersApi.list).mock.calls.at(-1)?.[0];
}

describe('UsersListPage', () => {
  beforeEach(() => {
    vi.mocked(usersApi.list).mockReset();
  });

  it('R2 (CCD098): mostra o último acesso de hoje com a hora', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-12T18:00:00'));
    mockList([buildUser({ name: 'Bia Vendedora', lastLoginAt: '2026-11-12T14:28:00' })]);
    renderPage();

    expect(await screen.findByText('Hoje, 14:28')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('CA1 (CCD098): lista mostra @, telefone e último acesso', async () => {
    mockList([
      buildUser({
        name: 'Bia Vendedora',
        username: 'bia.vendas',
        phone: '11912345678',
        lastLoginAt: '2026-11-01T10:00:00.000Z',
        lastLoginIp: '189.40.12.91',
      }),
    ]);
    renderPage();

    expect(await screen.findByText(/@bia\.vendas/)).toBeInTheDocument();
    expect(screen.getByText('+55 (11) 91234-5678')).toBeInTheDocument();
    expect(screen.getByText('189.40.12.91')).toBeInTheDocument();
  });

  it('CA1 (CCD098): sem @, telefone ou último acesso mostra os vazios', async () => {
    mockList([buildUser({ name: 'Sem Dados' })]);
    renderPage();

    expect(await screen.findByText('Sem Dados')).toBeInTheDocument();
    expect(screen.getByText('Sem telefone verif.')).toBeInTheDocument();
    expect(screen.getByText('Nunca')).toBeInTheDocument();
  });

  it('CA1: lista os usuários com papel e status', async () => {
    mockList([buildUser({ name: 'Bia Vendedora', role: 'SELLER', status: 'SUSPENDED' })]);
    renderPage();

    expect(await screen.findByText('Bia Vendedora')).toBeInTheDocument();
    expect(screen.getByText('Vendedor', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Suspenso', { selector: 'span' })).toBeInTheDocument();
  });

  it('CA1: busca por nome ou e-mail envia q para a API', async () => {
    mockList([]);
    renderPage();
    await screen.findByText('Nenhum usuário encontrado');

    await userEvent.type(
      screen.getByLabelText('Buscar por nome, @, e-mail, CPF, CNPJ ou ID (#USR-)'),
      'ana',
    );

    await vi.waitFor(() => expect(lastListCall()).toMatchObject({ q: 'ana' }));
  });

  it('CA2 (CCD098): busca por CPF mostra só o usuário dono do CPF', async () => {
    const cpf = '52998224725';
    mockList([buildUser({ name: 'Ana Colecionadora', cpf })]);
    renderPage();
    await screen.findByText('Ana Colecionadora');

    await userEvent.type(
      screen.getByLabelText('Buscar por nome, @, e-mail, CPF, CNPJ ou ID (#USR-)'),
      '529.982.247-25',
    );

    await vi.waitFor(() => expect(lastListCall()).toMatchObject({ q: '529.982.247-25' }));
    expect(await screen.findByText('Ana Colecionadora')).toBeInTheDocument();
  });

  it('CA1: filtra por papel', async () => {
    mockList([]);
    renderPage();
    await screen.findByText('Nenhum usuário encontrado');

    await userEvent.selectOptions(screen.getByLabelText('Papel'), 'ADMIN');

    await vi.waitFor(() => expect(lastListCall()).toMatchObject({ role: 'ADMIN' }));
  });

  it('CA1: filtra por status', async () => {
    mockList([]);
    renderPage();
    await screen.findByText('Nenhum usuário encontrado');

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'SUSPENDED');

    await vi.waitFor(() => expect(lastListCall()).toMatchObject({ status: 'SUSPENDED' }));
  });

  it('R4: o botão Visualizar leva para a tela de detalhe', async () => {
    const user = buildUser();
    mockList([user]);
    renderPage();
    await screen.findByText(user.name);

    await userEvent.click(screen.getByRole('button', { name: 'Visualizar' }));

    expect(await screen.findByText('Tela de detalhe')).toBeInTheDocument();
  });

  it('R4: clicar na linha leva para a tela de detalhe', async () => {
    const user = buildUser();
    mockList([user]);
    renderPage();
    await screen.findByText(user.name);

    await userEvent.click(screen.getByText(user.email));

    expect(await screen.findByText('Tela de detalhe')).toBeInTheDocument();
  });
});

describe('UsersListPage - toasts das ações administrativas', () => {
  beforeEach(() => {
    vi.mocked(usersApi.list).mockReset();
    vi.mocked(usersApi.create).mockReset();
    vi.mocked(usersApi.update).mockReset();
    vi.mocked(usersApi.suspend).mockReset();
    vi.mocked(usersApi.reactivate).mockReset();
    vi.mocked(usersApi.remove).mockReset();
  });

  it('CA2: cria um usuário e mostra o toast de cadastrado', async () => {
    mockList([]);
    vi.mocked(usersApi.create).mockResolvedValue(
      buildUser({ name: 'Bia Vendedora', email: 'bia@cromocard.dev', role: 'SELLER' }),
    );
    renderPage();
    await screen.findByText('Nenhum usuário encontrado');

    await userEvent.click(screen.getByRole('button', { name: '+ Novo Usuário no Sistema' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome completo'), 'Bia Vendedora');
    await userEvent.type(within(dialog).getByLabelText('E-mail'), 'bia@cromocard.dev');
    await userEvent.selectOptions(within(dialog).getByLabelText('Papel'), 'SELLER');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cadastrar Usuário' }));

    expect(await screen.findByText('Usuário cadastrado com sucesso.')).toBeInTheDocument();
  });

  it('CA3: edita um usuário e mostra o toast de atualizado', async () => {
    const user = buildUser();
    mockList([user]);
    vi.mocked(usersApi.update).mockResolvedValue({ ...user, name: 'Ana Silva' });
    renderPage();
    await screen.findByText(user.name);

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await userEvent.clear(screen.getByLabelText('Nome completo'));
    await userEvent.type(screen.getByLabelText('Nome completo'), 'Ana Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Usuário atualizado com sucesso.')).toBeInTheDocument();
  });

  it('CA4: suspende um usuário ativo e mostra o toast de suspenso', async () => {
    const user = buildUser({ status: 'ACTIVE' });
    mockList([user]);
    vi.mocked(usersApi.suspend).mockResolvedValue({ ...user, status: 'SUSPENDED' });
    renderPage();
    await screen.findByText(user.name);

    const table = screen.getByRole('table');
    await userEvent.click(within(table).getByRole('button', { name: 'Suspender' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo'), 'Violou as regras da comunidade');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Suspender' }));

    expect(await screen.findByText('Usuário suspenso com sucesso.')).toBeInTheDocument();
  });

  it('CA5: reativa um usuário suspenso e mostra o toast de reativado', async () => {
    const user = buildUser({ status: 'SUSPENDED' });
    mockList([user]);
    vi.mocked(usersApi.reactivate).mockResolvedValue({ ...user, status: 'ACTIVE' });
    renderPage();
    await screen.findByText(user.name);

    const table = screen.getByRole('table');
    await userEvent.click(within(table).getByRole('button', { name: 'Reativar' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.type(within(dialog).getByLabelText('Motivo'), 'Prazo da suspensão terminou');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reativar' }));

    expect(await screen.findByText('Usuário reativado com sucesso.')).toBeInTheDocument();
  });

  it('CA6: exclui um usuário e mostra o toast de excluído', async () => {
    const user = buildUser();
    mockList([user]);
    vi.mocked(usersApi.remove).mockResolvedValue(undefined);
    renderPage();
    await screen.findByText(user.name);

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

    expect(await screen.findByText('Usuário excluído com sucesso.')).toBeInTheDocument();
  });
});
