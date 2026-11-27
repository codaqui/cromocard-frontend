import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { RouteObject } from 'react-router';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { authRoutes, tokenLinkRoutes } from './auth.routes';

type LazyRoute = () => Promise<{ Component?: { name: string }; element?: ReactElement }>;

function lazyOf(routes: RouteObject[], path: string): LazyRoute | undefined {
  const children = routes.flatMap((route) => [route, ...(route.children ?? [])]);
  return children.find((route) => route.path === path)?.lazy as LazyRoute | undefined;
}

describe('auth.routes', () => {
  it('L18: Continuar com Google abre a página em construção da CCD004', async () => {
    const loaded = await lazyOf(authRoutes, paths.googleLogin)?.();
    render(loaded?.element ?? null);

    expect(screen.getByRole('heading', { name: 'Entrar com Google' })).toBeVisible();
    expect(screen.getByText('Esta tela chega com a user story CCD004.')).toBeVisible();
  });

  it.each([
    [paths.verifyEmail, 'VerifyEmailPage'],
    [paths.resetPassword, 'ResetPasswordPage'],
  ])('carrega a página do link do e-mail em %s', async (path, name) => {
    const loaded = await lazyOf(tokenLinkRoutes, path)?.();
    expect(loaded?.Component?.name).toBe(name);
  });
});
