import { Outlet } from 'react-router';

import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.shell} data-theme="auth">
      <div className={styles.formColumn}>
        <main className={styles.content}>
          <Outlet />
        </main>
        <footer className={styles.footer}>© 2026 CromoCard</footer>
      </div>
      <aside className={styles.showcase} aria-hidden="true" />
    </div>
  );
}
