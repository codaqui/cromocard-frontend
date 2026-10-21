import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const authRoutes: RouteObject[] = [
  {
    path: paths.login,
    lazy: async () => ({
      Component: (await import('./pages/LoginPage/LoginPage')).LoginPage,
    }),
  },
  {
    path: paths.setupPassword,
    lazy: async () => ({
      Component: (await import('./pages/SetupPasswordPage/SetupPasswordPage')).SetupPasswordPage,
    }),
  },
];
