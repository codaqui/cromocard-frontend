import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/routes/underConstructionRoute';

export const auditLogsRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.backoffice.auditLogs, title: 'Logs', story: 'CCD065' }),
];
