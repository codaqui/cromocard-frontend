import type { RouteObject } from 'react-router';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { authRoutes, tokenLinkRoutes } from './auth.routes';

type LazyRoute = () => Promise<{ Component?: { name: string }; element?: unknown }>;

function lazyOf(routes: RouteObject[], path: string): LazyRoute | undefined {
  const children = routes.flatMap((route) => [route, ...(route.children ?? [])]);
  return children.find((route) => route.path === path)?.lazy as LazyRoute | undefined;
}

describe('auth.routes', () => {
  it('L18: Continuar com Google abre a página em construção', async () => {
    const loaded = await lazyOf(authRoutes, paths.googleLogin)?.();
    expect(loaded?.element).toBeDefined();
  });

  it.each([
    [paths.verifyEmail, 'VerifyEmailPage'],
    [paths.resetPassword, 'ResetPasswordPage'],
  ])('carrega a página do link do e-mail em %s', async (path, name) => {
    const loaded = await lazyOf(tokenLinkRoutes, path)?.();
    expect(loaded?.Component?.name).toBe(name);
  });
});
