import { type ReactNode, useId } from 'react';

import styles from './KpiCard.module.css';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <h3 id={labelId} className={styles.label}>
        {label}
      </h3>
      <p className={styles.value}>{value}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </section>
  );
}
