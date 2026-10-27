import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RedirectIfAuthenticated } from '@/routes/guards/RedirectIfAuthenticated';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

const routes = [
  { path: paths.profile, element: <p>Perfil</p> },
  { path: paths.backoffice.dashboard, element: <p>Dashboard</p> },
  { path: paths.backoffice.users, element: <p>Usuários</p> },
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: paths.login, element: <p>Login</p> }],
  },
];

describe('RedirectIfAuthenticated', () => {
  it('mostra o login para o visitante', async () => {
    renderWithProviders({ routes, initialPath: paths.login });

    expect(await screen.findByText('Login')).toBeInTheDocument();
  });

  it('manda quem já está logado para a home do seu papel', async () => {
    renderWithProviders({ routes, initialPath: paths.login, user: { id: '1', role: 'ADMIN' } });

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('respeita a página pedida antes do login quando a sessão chega', async () => {
    renderWithProviders({
      routes,
      initialPath: `${paths.login}?redirect=${encodeURIComponent(paths.backoffice.users)}`,
      user: { id: '1', role: 'ADMIN' },
    });

    expect(await screen.findByText('Usuários')).toBeInTheDocument();
  });
});
