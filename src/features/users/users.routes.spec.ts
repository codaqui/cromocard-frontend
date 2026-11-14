import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';

import { usersBackofficeRoutes, usersRoutes } from './users.routes';

vi.mock('./pages/ProfilePage/ProfilePage', () => ({ ProfilePage: () => null }));
vi.mock('./pages/UsersListPage/UsersListPage', () => ({ UsersListPage: () => null }));
vi.mock('./pages/UserDetailPage/UserDetailPage', () => ({ UserDetailPage: () => null }));

async function componentNameOf(route: { lazy?: unknown }) {
  const lazy = route.lazy as () => Promise<{ Component: { name: string } }>;
  return (await lazy()).Component.name;
}

describe('users.routes', () => {
  it('carrega o perfil e as telas do BackOffice sob demanda, cada uma no seu caminho', async () => {
    expect(usersRoutes.map((route) => route.path)).toEqual([paths.profile]);
    expect(usersBackofficeRoutes.map((route) => route.path)).toEqual([
      paths.backoffice.users,
      paths.backoffice.userDetail,
    ]);
    expect(await componentNameOf(usersRoutes[0]!)).toBe('ProfilePage');
    expect(await componentNameOf(usersBackofficeRoutes[0]!)).toBe('UsersListPage');
    expect(await componentNameOf(usersBackofficeRoutes[1]!)).toBe('UserDetailPage');
  });
});
