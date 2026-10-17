import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { cn } from '@/utils/cn';

import styles from './NavItem.module.css';

interface NavItemProps {
  to: string;
  children: ReactNode;
}

export function NavItem({ to, children }: NavItemProps) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(styles.link, isActive && styles.active)}>
      {children}
    </NavLink>
  );
}
