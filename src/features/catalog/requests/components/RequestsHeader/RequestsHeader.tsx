import type { ReactNode } from 'react';

import { Icon } from '@/components/Icon/Icon';

import styles from './RequestsHeader.module.css';

interface RequestsHeaderProps {
  pending?: number;
  children: ReactNode;
}

export function RequestsHeader({ pending, children }: RequestsHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="approval" size={24} />
        </span>
        <div className={styles.titles}>
          <h1 className={styles.title}>Fila de Solicitações</h1>
          <p className={styles.subtitle}>
            Sugestões de cartas, álbuns e categorias enviadas pelos usuários.
          </p>
        </div>
        <p className={styles.status}>
          <span className={styles.statusLabel}>Status da fila</span>
          <span className={styles.statusValue}>
            <Icon name="pauseCircle" size={14} />
            {pending ?? 0} Pendentes
          </span>
        </p>
      </div>
      {children}
    </header>
  );
}
