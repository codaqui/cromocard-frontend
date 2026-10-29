import type { IconName } from '@/components/Icon/icon-paths';
import { paths } from '@/routes/paths';

interface AdminMenuItem {
  to: string;
  label: string;
  icon: IconName;
}

export const adminMenu: AdminMenuItem[] = [
  { to: paths.backoffice.dashboard, label: 'Dashboard', icon: 'dashboard' },
  { to: paths.backoffice.users, label: 'Usuários', icon: 'users' },
  { to: paths.backoffice.notifications, label: 'Notificação', icon: 'campaign' },
  { to: paths.backoffice.catalog, label: 'Catálogo', icon: 'cards' },
  { to: paths.backoffice.communities, label: 'Comunidades', icon: 'forum' },
  { to: paths.backoffice.reports, label: 'Relatórios', icon: 'reports' },
  { to: paths.backoffice.requests, label: 'Solicitações', icon: 'approval' },
  { to: paths.backoffice.auditLogs, label: 'Logs', icon: 'shield' },
  { to: paths.backoffice.settings, label: 'Configurações', icon: 'settings' },
];
