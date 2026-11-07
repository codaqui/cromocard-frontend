import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';

export const notificationsBackofficeRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.backoffice.notifications,
    title: 'Notificação',
    story: 'CCD060',
  }),
];

export const notificationsRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.notifications, title: 'Notificações', story: 'CCD053' }),
];
