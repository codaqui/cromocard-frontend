import { type ReactNode, useId } from 'react';

import { cn } from '@/utils/cn';

import styles from './DashboardKpis.module.css';

export type KpiGlow = 'primary' | 'accent' | 'warning';

export interface KpiTileProps {
  label: string;
  value: string;
  unit?: string;
  badge?: string;
  badgeTone?: 'info' | 'warning';
  description: string;
  glow: KpiGlow;
  aside?: ReactNode;
  footer?: ReactNode;
}

interface TileHeadingProps {
  labelId: string;
  label: string;
  badge?: string;
  badgeTone: 'info' | 'warning';
}

function TileHeading({ labelId, label, badge, badgeTone }: TileHeadingProps) {
  return (
    <div className={styles.heading}>
      <h2 id={labelId} className={styles.label}>
        {label}
      </h2>
      {badge && <span className={cn(styles.badge, styles[`${badgeTone}Badge`])}>{badge}</span>}
    </div>
  );
}

function TileFigure({ value, unit, aside }: Pick<KpiTileProps, 'value' | 'unit' | 'aside'>) {
  return (
    <div className={styles.figure}>
      <p className={styles.value}>
        {value}
        {unit && <span className={styles.unit}> {unit}</span>}
      </p>
      {aside}
    </div>
  );
}

export function KpiTile({
  label,
  badge,
  badgeTone = 'info',
  glow,
  footer,
  ...figure
}: KpiTileProps) {
  const labelId = useId();

  return (
    <section className={styles.tile} aria-labelledby={labelId}>
      <span className={cn(styles.glow, styles[glow])} aria-hidden="true" />
      <div className={styles.body}>
        <TileHeading labelId={labelId} label={label} badge={badge} badgeTone={badgeTone} />
        <TileFigure value={figure.value} unit={figure.unit} aside={figure.aside} />
        <p className={styles.description}>{figure.description}</p>
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
