import { paths } from '@/routes/paths';

import catalogIcon from './assets/menu-catalog.svg';
import communitiesIcon from './assets/menu-communities.svg';
import dashboardIcon from './assets/menu-dashboard.svg';
import logsIcon from './assets/menu-logs.svg';
import notificationsIcon from './assets/menu-notifications.svg';
import reportsIcon from './assets/menu-reports.svg';
import requestsIcon from './assets/menu-requests.svg';
import settingsIcon from './assets/menu-settings.svg';
import usersIcon from './assets/menu-users.svg';

interface AdminMenuItem {
  to: string;
  label: string;
  iconMask: string;
}

export const adminMenu: AdminMenuItem[] = [
  { to: paths.backoffice.dashboard, label: 'Dashboard', iconMask: dashboardIcon },
  { to: paths.backoffice.users, label: 'Usuários', iconMask: usersIcon },
  { to: paths.backoffice.notifications, label: 'Notificação', iconMask: notificationsIcon },
  { to: paths.backoffice.catalog, label: 'Catálogo', iconMask: catalogIcon },
  { to: paths.backoffice.communities, label: 'Comunidades', iconMask: communitiesIcon },
  { to: paths.backoffice.reports, label: 'Relatórios', iconMask: reportsIcon },
  { to: paths.backoffice.requests, label: 'Solicitações', iconMask: requestsIcon },
  { to: paths.backoffice.auditLogs, label: 'Logs', iconMask: logsIcon },
  { to: paths.backoffice.settings, label: 'Configurações', iconMask: settingsIcon },
];
