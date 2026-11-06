import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './NavItem.module.css';

interface NavItemProps {
  to: string;
  icon?: IconName;
  iconMask?: string;
  children: ReactNode;
}

export function NavItem({ to, icon, iconMask, children }: NavItemProps) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(styles.link, isActive && styles.active)}>
      {icon && <Icon name={icon} />}
      {iconMask && (
        <span
          className={styles.iconMask}
          style={{ maskImage: `url("${iconMask}")` }}
          aria-hidden="true"
        />
      )}
      {children}
    </NavLink>
  );
}
