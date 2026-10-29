import { type ReactNode, useId } from 'react';

import { Badge, type BadgeTone } from '@/components/Badge/Badge';

import styles from './KpiCard.module.css';

interface KpiTrend {
  label: string;
  tone?: BadgeTone;
}

interface KpiCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  trend?: KpiTrend;
}

export function KpiCard({ label, value, unit, hint, trend }: KpiCardProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <header className={styles.header}>
        <h2 id={labelId} className={styles.label}>
          {label}
        </h2>
        {trend && <Badge tone={trend.tone ?? 'success'}>{trend.label}</Badge>}
      </header>
      <p className={styles.value}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </section>
  );
}
