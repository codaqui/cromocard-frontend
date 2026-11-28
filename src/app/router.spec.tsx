import { isValidElement } from 'react';
import { matchRoutes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { RequireAuth } from '@/routes/guards/RequireAuth';

import { router } from './router';

function match(pathname: string) {
  return matchRoutes(router.routes, pathname) ?? [];
}

function leafPath(pathname: string) {
  return match(pathname).at(-1)?.route.path;
}

function requiresLogin(pathname: string) {
  return match(pathname).some(
    ({ route }) => isValidElement(route.element) && route.element.type === RequireAuth,
  );
}

describe('router', () => {
  it('R1: o perfil da carta é público', () => {
    expect(leafPath('/cartas/c1')).toBe('/cartas/:id');
    expect(requiresLogin('/cartas/c1')).toBe(false);
  });

  it('R9: Ver anúncio leva à página pública do anúncio', () => {
    expect(leafPath('/anuncios/a1')).toBe('/anuncios/:id');
    expect(requiresLogin('/anuncios/a1')).toBe(false);
  });

  it('L14: Anunciar esta carta leva à criação de anúncio, que pede login', () => {
    expect(leafPath('/anuncios/novo')).toBe('/anuncios/novo');
    expect(requiresLogin('/anuncios/novo')).toBe(true);
  });
});
