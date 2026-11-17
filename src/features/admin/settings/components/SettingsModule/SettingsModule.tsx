import { type ReactNode, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import styles from './SettingsModule.module.css';

interface SettingsModuleProps {
  icon: IconName;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function SettingsModule({ icon, title, subtitle, actions, children }: SettingsModuleProps) {
  const titleId = useId();

  return (
    <section className={styles.module} aria-labelledby={titleId}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.icon}>
            <Icon name={icon} size={18} />
          </span>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {children}
    </section>
  );
}
