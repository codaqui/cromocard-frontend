import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';

import { publicRoutes } from './public.routes';

vi.mock('./help/pages/HelpCenterPage/HelpCenterPage', () => ({ HelpCenterPage: () => null }));
vi.mock('./how-it-works/pages/HowItWorksPage/HowItWorksPage', () => ({
  HowItWorksPage: () => null,
}));

async function componentNameOf(route: { lazy?: unknown }) {
  const lazy = route.lazy as () => Promise<{ Component: { name: string } }>;
  return (await lazy()).Component.name;
}

describe('public.routes', () => {
  it('CA1 e CA5: a Central de ajuda e o Como funciona abrem nos caminhos públicos', async () => {
    expect(publicRoutes.map((route) => route.path)).toEqual([paths.help, paths.howItWorks]);
    expect(await componentNameOf(publicRoutes[0]!)).toBe('HelpCenterPage');
    expect(await componentNameOf(publicRoutes[1]!)).toBe('HowItWorksPage');
  });
});
