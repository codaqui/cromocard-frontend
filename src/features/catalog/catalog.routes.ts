import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const catalogBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.catalog,
    lazy: async () => ({
      Component: (await import('./pages/CardsAdminPage/CardsAdminPage')).CardsAdminPage,
    }),
  },
  {
    path: paths.backoffice.albums,
    lazy: async () => ({
      Component: (await import('./pages/AlbumsAdminPage/AlbumsAdminPage')).AlbumsAdminPage,
    }),
  },
];
