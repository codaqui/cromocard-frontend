import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import styles from './AuthStatus.module.css';

type AuthStatusTone = 'info' | 'success' | 'danger';

const iconByTone: Record<AuthStatusTone, IconName> = {
  info: 'envelope',
  success: 'checkCircle',
  danger: 'errorCircle',
};

interface AuthStatusProps {
  tone: AuthStatusTone;
  title: string;
  children: ReactNode;
}

export function AuthStatus({ tone, title, children }: AuthStatusProps) {
  return (
    <section className={styles.status} data-tone={tone}>
      <span className={styles.icon}>
        <Icon name={iconByTone[tone]} size={32} />
      </span>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
