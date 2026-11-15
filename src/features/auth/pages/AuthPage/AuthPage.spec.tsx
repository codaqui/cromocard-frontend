import { screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';
import { preloadLazyRoutes } from '@/test/preloadLazyRoutes';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authRoutes } from '../../auth.routes';

describe('AuthPage', () => {
  beforeAll(() => preloadLazyRoutes(authRoutes), 30_000);

  it('abre /login com a aba Fazer Login ativa', async () => {
    renderWithProviders({ routes: authRoutes, initialPath: paths.login });

    expect(
      await screen.findByRole('heading', { name: 'Faça login na sua conta' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fazer Login' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('abre /cadastro na mesma página com a aba Criar Conta ativa', async () => {
    renderWithProviders({ routes: authRoutes, initialPath: paths.register });

    expect(
      await screen.findByRole('heading', { name: 'Comece sua jornada no CromoCard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar Conta' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
