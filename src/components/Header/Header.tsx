import type { ReactNode } from 'react';
import { Link } from 'react-router';

import styles from './Header.module.css';

interface HeaderProps {
  homePath: string;
  children?: ReactNode;
}

export function Header({ homePath, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link to={homePath} className={styles.brand}>
        CromoCard
      </Link>
      <nav className={styles.nav}>{children}</nav>
    </header>
  );
}
