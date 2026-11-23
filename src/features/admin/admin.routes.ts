import type { RouteObject } from 'react-router';

import { auditLogsRoutes } from './audit-logs';
import { dashboardRoutes } from './dashboard';
import { globalNotificationsRoutes } from './notifications';
import { reportsRoutes } from './reports';
import { settingsRoutes } from './settings';

export const adminBackofficeRoutes: RouteObject[] = [
  ...dashboardRoutes,
  ...globalNotificationsRoutes,
  ...reportsRoutes,
  ...auditLogsRoutes,
  ...settingsRoutes,
];
