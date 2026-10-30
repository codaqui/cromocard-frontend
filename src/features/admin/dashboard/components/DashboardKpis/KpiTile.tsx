import { type ReactNode, useId } from 'react';

import { cn } from '@/utils/cn';

import styles from './DashboardKpis.module.css';

export type KpiGlow = 'primary' | 'accent' | 'warning';

export interface KpiTileProps {
  label: string;
  value: string;
  unit?: string;
  description: string;
  glow: KpiGlow;
  aside?: ReactNode;
  footer?: ReactNode;
}

export function KpiTile({ label, value, unit, description, glow, aside, footer }: KpiTileProps) {
  const labelId = useId();

  return (
    <section className={styles.tile} aria-labelledby={labelId}>
      <span className={cn(styles.glow, styles[glow])} aria-hidden="true" />
      <div className={styles.body}>
        <h2 id={labelId} className={styles.label}>
          {label}
        </h2>
        <div className={styles.figure}>
          <p className={styles.value}>
            {value}
            {unit && <span className={styles.unit}> {unit}</span>}
          </p>
          {aside}
        </div>
        <p className={styles.description}>{description}</p>
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
