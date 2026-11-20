import { type ReactNode, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './DashboardKpis.module.css';

export type KpiGlow = 'primary' | 'accent' | 'warning';

export interface KpiTileProps {
  label: string;
  value: string;
  unit?: string;
  badge?: string;
  badgeTone?: 'info' | 'warning';
  badgeIcon?: IconName;
  description: string;
  descriptionTone?: 'accent';
  descriptionIcon?: IconName;
  glow: KpiGlow;
  aside?: ReactNode;
  footer?: ReactNode;
}

interface TileHeadingProps extends Pick<
  KpiTileProps,
  'label' | 'badge' | 'badgeTone' | 'badgeIcon'
> {
  labelId: string;
}

function TileHeading({ labelId, label, badge, badgeTone = 'info', badgeIcon }: TileHeadingProps) {
  return (
    <div className={styles.heading}>
      <h2 id={labelId} className={styles.label}>
        {label}
      </h2>
      {badge && (
        <span className={cn(styles.badge, styles[`${badgeTone}Badge`])}>
          {badgeIcon && <Icon name={badgeIcon} size={14} />}
          {badge}
        </span>
      )}
    </div>
  );
}

function TileDescription({
  description,
  descriptionTone,
  descriptionIcon,
}: Pick<KpiTileProps, 'description' | 'descriptionTone' | 'descriptionIcon'>) {
  return (
    <p className={cn(styles.description, descriptionTone && styles.accentText)}>
      {descriptionIcon && <Icon name={descriptionIcon} size={16} />}
      {description}
    </p>
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

export function KpiTile({ glow, footer, ...tile }: KpiTileProps) {
  const labelId = useId();

  return (
    <section className={styles.tile} aria-labelledby={labelId}>
      <span className={cn(styles.glow, styles[glow])} aria-hidden="true" />
      <div className={styles.body}>
        <TileHeading labelId={labelId} {...tile} />
        <TileFigure {...tile} />
        <TileDescription {...tile} />
      </div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
