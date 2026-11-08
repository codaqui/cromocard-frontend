import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const communityBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.communities,
    lazy: async () => ({
      Component: (await import('./admin/pages/CommunityAdminPage/CommunityAdminPage'))
        .CommunityAdminPage,
    }),
  },
];
