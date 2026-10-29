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
        <NavItem key={item.to} to={item.to} icon={item.icon}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

export function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <div className={styles.shell} data-theme="backoffice">
      <Header homePath={paths.backoffice.root}>
        <span className={styles.role}>Administrador</span>
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
