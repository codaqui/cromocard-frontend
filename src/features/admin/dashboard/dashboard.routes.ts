import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const dashboardRoutes: RouteObject[] = [
  {
    path: paths.backoffice.dashboard,
    lazy: async () => ({
      Component: (await import('./pages/DashboardPage/DashboardPage')).DashboardPage,
    }),
  },
];
