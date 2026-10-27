import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequireRole } from '@/routes/guards/RequireRole';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

const routes = [
  { path: paths.login, element: <p>Login</p> },
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

  it('CA18: manda o cliente que abre /backoffice para a home dele', async () => {
    const router = renderWithProviders({
      routes,
      initialPath: paths.backoffice.users,
      user: { id: '1', role: 'CUSTOMER' },
    });

    expect(await screen.findByText('Perfil')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.profile);
  });

  it('CA18: manda o visitante para o login, guardando a página pedida', async () => {
    const router = renderWithProviders({ routes, initialPath: `${paths.backoffice.users}?page=2` });

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.login);
    expect(new URLSearchParams(router.state.location.search).get('redirect')).toBe(
      `${paths.backoffice.users}?page=2`,
    );
  });

  it('espera a sessão ser restaurada antes de decidir', () => {
    renderWithProviders({ routes, initialPath: paths.backoffice.users, isRestoringSession: true });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando sessão…');
  });
});
