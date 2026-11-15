import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

export const usersRoutes: RouteObject[] = [
  {
    path: paths.profile,
    lazy: async () => ({
      Component: (await import('./pages/ProfilePage/ProfilePage')).ProfilePage,
    }),
  },
  underConstructionRoute({ path: paths.settings, title: 'Configurações', story: 'CCD051' }),
];

export const usersPublicRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.help, title: 'Central de ajuda', story: 'CCD005' }),
];

export const usersBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.users,
    lazy: async () => ({
      Component: (await import('./pages/UsersListPage/UsersListPage')).UsersListPage,
    }),
  },
  {
    path: paths.backoffice.userDetail,
    lazy: async () => ({
      Component: (await import('./pages/UserDetailPage/UserDetailPage')).UserDetailPage,
    }),
  },
];
