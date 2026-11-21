import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const reportsRoutes: RouteObject[] = [
  {
    path: paths.backoffice.reports,
    lazy: async () => ({
      Component: (await import('./pages/ReportsPage/ReportsPage')).ReportsPage,
    }),
  },
];
