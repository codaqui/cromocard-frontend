import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Icon } from '@/components/Icon/Icon';

import styles from './ReportsHistory.module.css';

export function ReportsHistory() {
  return (
    <section className={styles.panel} aria-labelledby="reports-history-title">
      <header className={styles.header}>
        <span className={styles.icon}>
          <Icon name="restartAlt" size={18} />
        </span>
        <div className={styles.heading}>
          <h2 id="reports-history-title" className={styles.title}>
            Histórico de relatórios
          </h2>
          <p className={styles.subtitle}>Relatórios exportados pela equipe nos últimos 90 dias.</p>
        </div>
        <span className={styles.retention}>Arquivos disponíveis por 90 dias</span>
      </header>
      <EmptyState
        title="O histórico de exportações chega em breve"
        message="Por enquanto, o arquivo é baixado na hora da exportação."
      />
    </section>
  );
}
