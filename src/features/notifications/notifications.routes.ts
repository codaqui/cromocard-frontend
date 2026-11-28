import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

export const notificationsRoutes: RouteObject[] = [
  {
    path: paths.notifications,
    lazy: async () => {
      const { NotificationsPage } = await import('./pages/NotificationsPage/NotificationsPage');
      return { Component: NotificationsPage };
    },
  },
  underConstructionRoute({ path: paths.favorites, title: 'Meus Favoritos', story: 'CCD055' }),
];
