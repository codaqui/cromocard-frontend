import { Outlet } from 'react-router';

import { Footer } from '@/components/Footer/Footer';
import { Header } from '@/components/Header/Header';
import { paths } from '@/routes/paths';

import styles from './PublicLayout.module.css';

export function PublicLayout() {
  return (
    <div className={styles.shell}>
      <Header homePath={paths.home} />
      <main className={styles.content}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
