import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { BrandLogo } from '@/components/BrandLogo/BrandLogo';

import styles from './Header.module.css';

interface HeaderProps {
  homePath: string;
  children?: ReactNode;
}

export function Header({ homePath, children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Link to={homePath} className={styles.brand} aria-label="CromoCard">
        <BrandLogo />
      </Link>
      <div className={styles.actions}>{children}</div>
    </header>
  );
}
