import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/routes/underConstructionRoute';

export const notificationsBackofficeRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.backoffice.notifications,
    title: 'Notificação',
    story: 'CCD060',
  }),
];
