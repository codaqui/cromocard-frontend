import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import styles from './SuggestionPanel.module.css';

interface SuggestionPanelProps {
  label: string;
  icon: IconName;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export function SuggestionPanel({ label, icon, title, aside, children }: SuggestionPanelProps) {
  return (
    <section className={styles.panel} aria-label={label}>
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>
          <Icon name={icon} size={14} />
          {title}
        </h3>
        {aside}
      </header>
      {children}
    </section>
  );
}
