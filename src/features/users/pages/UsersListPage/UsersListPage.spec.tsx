import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { usersApi } from '../../users.api';
import type { UserSummary } from '../../users.types';
import { UsersListPage } from './UsersListPage';

vi.mock('../../users.api', () => ({ usersApi: { list: vi.fn() } }));

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
