import { describe, expect, it } from 'vitest';

import { notificationsRoutes } from './notifications.routes';

describe('notificationsRoutes', () => {
  it('tem a central de notificações e a página de favoritos', () => {
    expect(notificationsRoutes.map(({ path }) => path)).toEqual(['/notificacoes', '/favoritos']);
  });

  it('carrega a central sob demanda e deixa os favoritos em construção (CCD055)', async () => {
    const [central, favorites] = notificationsRoutes;

    const loaded = await (central?.lazy as () => Promise<{ Component: unknown }>)();

    expect(loaded.Component).toBeTypeOf('function');
    expect(favorites?.lazy ?? favorites?.element ?? favorites?.Component).toBeDefined();
  });
});
