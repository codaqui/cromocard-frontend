import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeShape = 'pill' | 'tag';

interface BadgeProps {
  tone?: BadgeTone;
  shape?: BadgeShape;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', shape = 'pill', children }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[tone], styles[shape])}
      data-tone={tone}
      data-shape={shape}
    >
      {children}
    </span>
  );
}
