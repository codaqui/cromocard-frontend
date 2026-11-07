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
    routes: [{ path: paths.backoffice.users, element: <UsersListPage /> }],
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

    await userEvent.type(screen.getByLabelText('Buscar por nome ou e-mail'), 'ana');

    await vi.waitFor(() => expect(lastListCall()).toMatchObject({ q: 'ana' }));
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

    await userEvent.click(screen.getByRole('button', { name: 'Novo usuário' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nome'), 'Bia Vendedora');
    await userEvent.type(within(dialog).getByLabelText('E-mail'), 'bia@cromocard.dev');
    await userEvent.selectOptions(within(dialog).getByLabelText('Papel'), 'SELLER');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Usuário cadastrado com sucesso.')).toBeInTheDocument();
  });

  it('CA3: edita um usuário e mostra o toast de atualizado', async () => {
    const user = buildUser();
    mockList([user]);
    vi.mocked(usersApi.update).mockResolvedValue({ ...user, name: 'Ana Silva' });
    renderPage();
    await screen.findByText(user.name);

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    await userEvent.clear(screen.getByLabelText('Nome'));
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva');
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
      within(dialog).getByLabelText(`Digite "${user.name}" para confirmar`),
      user.name,
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Usuário excluído com sucesso.')).toBeInTheDocument();
  });
});
