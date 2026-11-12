import { useId } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { formatCount, formatDailyAverage } from '../../audit-logs.format';
import styles from './AuditLogsKpi.module.css';

const SEGMENTS = Array.from({ length: 6 }, (_, index) => index);

interface AuditLogsKpiProps {
  last30Days?: number;
}

export function AuditLogsKpi({ last30Days }: AuditLogsKpiProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <span className={styles.icon}>
        <Icon name="verifiedUser" size={22} />
      </span>
      <h2 id={labelId} className={styles.label}>
        Ações registradas (30 dias)
      </h2>
      <p className={styles.value}>{last30Days === undefined ? '—' : formatCount(last30Days)}</p>
      {last30Days !== undefined && (
        <p className={styles.hint}>
          Média de {formatDailyAverage(last30Days)} intervenções moderadas/dia no ecossistema
          CromoCard.
        </p>
      )}
      <div className={styles.segments} aria-hidden="true">
        {SEGMENTS.map((segment) => (
          <span key={segment} className={styles.segment} />
        ))}
      </div>
    </section>
  );
}
