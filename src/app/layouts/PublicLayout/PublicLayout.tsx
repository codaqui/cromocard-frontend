import { Outlet } from 'react-router';

import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { NavItem } from '@/components/NavItem/NavItem';
import { paths } from '@/routes/paths';

import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.shell}>
      <Header homePath={paths.home}>
        <NavItem to={paths.login}>Entrar</NavItem>
        <NavItem to={paths.register}>Cadastrar</NavItem>
      </Header>
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
