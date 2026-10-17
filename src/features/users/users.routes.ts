import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const usersRoutes: RouteObject[] = [
  {
    path: paths.profile,
    lazy: async () => ({
      Component: (await import('./pages/ProfilePage/ProfilePage')).ProfilePage,
    }),
  },
];

export const usersBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.users,
    lazy: async () => ({
      Component: (await import('./pages/UsersListPage/UsersListPage')).UsersListPage,
    }),
  },
];
