import { Outlet } from 'react-router';

import { Header } from '@/components/Header/Header';
import { NavItem } from '@/components/NavItem/NavItem';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

import styles from './AdminLayout.module.css';

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
          <NavItem to={paths.backoffice.users}>Usuários</NavItem>
        </nav>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
