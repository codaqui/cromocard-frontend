import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { catalogCustomerRoutes } from './catalog.routes';

describe('catalogCustomerRoutes', () => {
  it('carrega a página Sugestões da comunidade em /sugestoes', async () => {
    const route = catalogCustomerRoutes.find(({ path }) => path === paths.suggestions);
    const lazy = route?.lazy as (() => Promise<{ Component: { name: string } }>) | undefined;

    const loaded = await lazy?.();

    expect(loaded?.Component.name).toBe('CommunitySuggestionsPage');
  });
});
