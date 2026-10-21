import { Outlet } from 'react-router';

import { Header } from '@/components/Header/Header';
import { NavItem } from '@/components/NavItem/NavItem';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

import styles from './AdminLayout.module.css';

const backofficeMenu = [
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

export function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <Header homePath={paths.backoffice.root}>
        <span className={styles.badge}>BackOffice</span>
        <Button variant="secondary" onClick={signOut}>
          Sair
        </Button>
      </Header>
      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Menu do backoffice">
          {backofficeMenu.map(({ to, label }) => (
            <NavItem key={to} to={to}>
              {label}
            </NavItem>
          ))}
        </nav>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
