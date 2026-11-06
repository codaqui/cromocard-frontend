import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

import { requestsRoutes } from './requests';

export const catalogBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.catalog,
    lazy: async () => ({
      Component: (await import('./pages/CatalogAdminPage/CatalogAdminPage')).CatalogAdminPage,
    }),
  },
  ...requestsRoutes,
];
