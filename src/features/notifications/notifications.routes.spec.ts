import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { notificationsRoutes } from './notifications.routes';

describe('notificationsRoutes', () => {
  it('a central de notificações do cliente continua em construção (CCD053)', () => {
    expect(notificationsRoutes.map(({ path }) => path)).toEqual([paths.notifications]);
  });
});
