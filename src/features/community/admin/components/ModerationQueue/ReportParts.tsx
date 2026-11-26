import type { ReactNode } from 'react';

import { formatAccountAge, formatPriorWarnings } from '../../community-admin.format';
import styles from './ModerationQueue.module.css';

export function OriginItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function AuthorPills({
  accountAgeDays,
  warnings,
}: {
  accountAgeDays: number;
  warnings: number;
}) {
  return (
    <div className={styles.authorStats}>
      <span className={styles.statPill}>{formatAccountAge(accountAgeDays)}</span>
      <span className={styles.statPill}>{formatPriorWarnings(warnings)}</span>
    </div>
  );
}
