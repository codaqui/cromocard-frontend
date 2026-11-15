import { Link, Outlet } from 'react-router';

import { Header } from '@/components/Header/Header';
import { Icon } from '@/components/Icon/Icon';
import { NavItem } from '@/components/NavItem/NavItem';
import { UserMenu } from '@/components/UserMenu/UserMenu';
import { useSignOut } from '@/hooks/useSignOut';
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
        <NavItem key={item.to} to={item.to} iconMask={item.iconMask}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

function AdminTopbar() {
  const signOut = useSignOut();

  return (
    <Header homePath={paths.backoffice.root}>
      <Link
        to={paths.backoffice.notifications}
        className={styles.notifications}
        aria-label="Notificações"
      >
        <Icon name="notifications" size={18} />
      </Link>
      <UserMenu
        name="Administrador"
        caption="BackOffice CromoCard"
        actions={[{ label: 'Sair', icon: 'logout', onSelect: signOut }]}
      />
    </Header>
  );
}

export function AdminLayout() {
  return (
    <div className={styles.shell} data-theme="backoffice">
      <AdminTopbar />
      <div className={styles.body}>
        <AdminMenu />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
