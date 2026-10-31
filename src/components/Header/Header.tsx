import type { ReactNode } from 'react';
import { Link } from 'react-router';

import styles from './Header.module.css';

interface HeaderProps {
  homePath: string;
  brand?: ReactNode;
  children?: ReactNode;
}

export function Header({ homePath, brand = 'CromoCard', children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link to={homePath} className={styles.brand} aria-label="CromoCard">
        {brand}
      </Link>
      <nav className={styles.nav}>{children}</nav>
    </header>
  );
}
