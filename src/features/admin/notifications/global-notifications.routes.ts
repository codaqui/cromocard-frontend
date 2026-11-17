import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const globalNotificationsRoutes: RouteObject[] = [
  {
    path: paths.backoffice.notifications,
    lazy: async () => ({
      Component: (await import('./pages/GlobalNotificationPage/GlobalNotificationPage'))
        .GlobalNotificationPage,
    }),
  },
];
