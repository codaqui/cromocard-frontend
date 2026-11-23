import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { catalogCustomerRoutes, catalogRoutes } from './catalog.routes';

describe('catalogCustomerRoutes', () => {
  it('carrega a página Sugestões da comunidade em /sugestoes', async () => {
    const route = catalogCustomerRoutes.find(({ path }) => path === paths.suggestions);
    const lazy = route?.lazy as (() => Promise<{ Component: { name: string } }>) | undefined;

    const loaded = await lazy?.();

    expect(loaded?.Component.name).toBe('CommunitySuggestionsPage');
  });
});

describe('catalogRoutes', () => {
  it('carrega o perfil público da carta em /cartas/:id', async () => {
    const route = catalogRoutes.find(({ path }) => path === paths.cardProfile);
    const lazy = route?.lazy as (() => Promise<{ Component: { name: string } }>) | undefined;

    const loaded = await lazy?.();

    expect(loaded?.Component.name).toBe('CardProfilePage');
  });
});
