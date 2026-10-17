import { Outlet } from 'react-router';

import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { NavItem } from '@/components/NavItem/NavItem';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

import styles from './CustomerLayout.module.css';

export function CustomerLayout() {
  const { signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <Header homePath={paths.profile}>
        <NavItem to={paths.profile}>Meu perfil</NavItem>
        <Button variant="secondary" onClick={signOut}>
          Sair
        </Button>
      </Header>
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
