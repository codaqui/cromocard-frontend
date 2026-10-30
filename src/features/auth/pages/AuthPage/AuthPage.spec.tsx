import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authRoutes } from '../../auth.routes';

describe('AuthPage', () => {
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
