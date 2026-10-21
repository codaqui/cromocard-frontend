import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

import { ComingSoonPage } from './pages/ComingSoonPage/ComingSoonPage';

export const adminBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.dashboard,
    lazy: async () => ({
      Component: (await import('./dashboard/pages/DashboardPage/DashboardPage')).DashboardPage,
    }),
  },
  {
    path: paths.backoffice.auditLogs,
    lazy: async () => ({
      Component: (await import('./audit-logs/pages/AuditLogsPage/AuditLogsPage')).AuditLogsPage,
    }),
  },
  {
    path: paths.backoffice.settings,
    lazy: async () => ({
      Component: (await import('./settings/pages/SettingsPage/SettingsPage')).SettingsPage,
    }),
  },
  {
    path: paths.backoffice.notifications,
    element: <ComingSoonPage title="Notificação global" plannedFor="Sprint 08 (CCD060)" />,
  },
  {
    path: paths.backoffice.communities,
    element: <ComingSoonPage title="Comunidades" plannedFor="Sprint 08 (CCD062)" />,
  },
  {
    path: paths.backoffice.reports,
    element: <ComingSoonPage title="Relatórios" plannedFor="Sprint 08 (CCD063)" />,
  },
  {
    path: paths.backoffice.requests,
    element: <ComingSoonPage title="Solicitações" plannedFor="Sprint 07 (CCD064)" />,
  },
];
