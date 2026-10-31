import { Link, Outlet } from 'react-router';

import { BrandLogo } from '@/components/BrandLogo/BrandLogo';
import { Button } from '@/components/Button/Button';
import { Header } from '@/components/Header/Header';
import { Icon } from '@/components/Icon/Icon';
import { NavItem } from '@/components/NavItem/NavItem';
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
        <NavItem key={item.to} to={item.to} icon={item.icon}>
          {item.label}
        </NavItem>
      ))}
    </nav>
  );
}

function AdminIdentity() {
  return (
    <div className={styles.identity}>
      <div className={styles.identityText}>
        <p className={styles.name}>Administrador</p>
        <p className={styles.role}>BackOffice CromoCard</p>
      </div>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name="person" size={18} />
      </span>
    </div>
  );
}

function AdminTopbar() {
  const signOut = useSignOut();

  return (
    <Header homePath={paths.backoffice.root} brand={<BrandLogo />}>
      <Link
        to={paths.backoffice.notifications}
        className={styles.notifications}
        aria-label="Notificações"
      >
        <Icon name="notifications" size={18} />
      </Link>
      <AdminIdentity />
      <Button variant="secondary" onClick={signOut}>
        Sair
      </Button>
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
