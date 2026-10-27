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
      <h2 id={labelId} className={styles.label}>
        {label}
      </h2>
      <p className={styles.value}>{value}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </section>
  );
}
