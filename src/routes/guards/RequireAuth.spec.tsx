import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RequireAuth } from '@/routes/guards/RequireAuth';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

const routes = [
  { path: paths.home, element: <p>Área pública</p> },
  { path: paths.login, element: <p>Login</p> },
  { element: <RequireAuth />, children: [{ path: paths.profile, element: <p>Perfil</p> }] },
];

describe('RequireAuth', () => {
  it('libera a área Cliente para quem tem sessão', async () => {
    renderWithProviders({
      routes,
      initialPath: paths.profile,
      user: { id: '1', role: 'CUSTOMER' },
    });

    expect(await screen.findByText('Perfil')).toBeInTheDocument();
  });

  it('CA18: manda o visitante da área Cliente para o login com o redirect', async () => {
    const router = renderWithProviders({ routes, initialPath: paths.profile });

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(new URLSearchParams(router.state.location.search).get('redirect')).toBe(paths.profile);
  });

  it('espera a sessão ser restaurada antes de decidir', () => {
    renderWithProviders({ routes, initialPath: paths.profile, isRestoringSession: true });

    expect(screen.getByRole('status')).toHaveTextContent('Carregando sessão…');
  });

  it('CA15: quem clicou em Sair volta para a área pública, sem passar pelo login', async () => {
    renderWithProviders({ routes, initialPath: paths.profile, hasSignedOut: true });

    expect(await screen.findByText('Área pública')).toBeInTheDocument();
  });
});
