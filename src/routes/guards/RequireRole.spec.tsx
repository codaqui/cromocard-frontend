import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequireRole } from '@/routes/guards/RequireRole';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

const routes = [
  { path: paths.home, element: <p>Início</p> },
  { path: paths.profile, element: <p>Perfil</p> },
  {
    element: <RequireRole role="ADMIN" />,
    children: [{ path: paths.backoffice.users, element: <p>Usuários do backoffice</p> }],
  },
];

describe('RequireRole', () => {
  it('libera a rota para o papel exigido', async () => {
    renderWithProviders({
      routes,
      initialPath: paths.backoffice.users,
      user: { id: '1', role: 'ADMIN' },
    });

    expect(await screen.findByText('Usuários do backoffice')).toBeInTheDocument();
  });

  it('manda o cliente para a área dele', async () => {
    const router = renderWithProviders({
      routes,
      initialPath: paths.backoffice.users,
      user: { id: '1', role: 'CUSTOMER' },
    });

    expect(await screen.findByText('Perfil')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.profile);
  });

  it('manda quem não está logado para o início', async () => {
    renderWithProviders({ routes, initialPath: paths.backoffice.users });

    expect(await screen.findByText('Início')).toBeInTheDocument();
  });
});
