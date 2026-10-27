import { paths } from '@/routes/paths';

interface AdminMenuItem {
  to: string;
  label: string;
}

export const adminMenu: AdminMenuItem[] = [
  { to: paths.backoffice.dashboard, label: 'Dashboard' },
  { to: paths.backoffice.users, label: 'Usuários' },
  { to: paths.backoffice.notifications, label: 'Notificação' },
  { to: paths.backoffice.catalog, label: 'Catálogo' },
  { to: paths.backoffice.communities, label: 'Comunidades' },
  { to: paths.backoffice.reports, label: 'Relatórios' },
  { to: paths.backoffice.requests, label: 'Solicitações' },
  { to: paths.backoffice.auditLogs, label: 'Logs' },
  { to: paths.backoffice.settings, label: 'Configurações' },
];
