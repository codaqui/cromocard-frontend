import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const auditLogsRoutes: RouteObject[] = [
  {
    path: paths.backoffice.auditLogs,
    lazy: async () => ({
      Component: (await import('./pages/AuditLogsPage/AuditLogsPage')).AuditLogsPage,
    }),
  },
];
