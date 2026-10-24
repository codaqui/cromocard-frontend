import { Outlet } from 'react-router';

import { Header } from '@/components/Header/Header';
import { NavItem } from '@/components/NavItem/NavItem';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

import styles from './AdminLayout.module.css';
import { adminMenu } from './adminMenu';

function AdminMenu() {
  return (
    <nav className={styles.sidebar} aria-labelledby="admin-menu-title">
      <h2 id="admin-menu-title" className={styles.menuTitle}>
        Módulos oficiais
      </h2>
      {adminMenu.map((item) => (
        <NavItem key={item.to} to={item.to}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

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
        <AdminMenu />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
