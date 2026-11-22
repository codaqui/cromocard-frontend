import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';

export const notificationsRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.notifications, title: 'Notificações', story: 'CCD053' }),
];
