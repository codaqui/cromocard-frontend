import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const requestsRoutes: RouteObject[] = [
  {
    path: paths.backoffice.requests,
    lazy: async () => ({
      Component: (await import('./pages/CatalogRequestsPage/CatalogRequestsPage'))
        .CatalogRequestsPage,
    }),
  },
];
