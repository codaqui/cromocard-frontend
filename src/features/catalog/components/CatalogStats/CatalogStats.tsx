import { useId } from 'react';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { formatCount } from '../../catalog.format';
import type { CatalogSummary } from '../../catalog.types';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogStats.module.css';

interface StatCardProps {
  label: string;
  value?: number;
  hint?: string;
  icon: CatalogIconName;
}

function StatCard({ label, value, hint, icon }: StatCardProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <div>
        <h2 id={labelId} className={styles.label}>
          {label}
        </h2>
        <p className={styles.value}>{formatCount(value)}</p>
        {hint && <p className={styles.warning}>{hint}</p>}
      </div>
      <span className={styles.icon}>
        <CatalogIcon name={icon} size={20} />
      </span>
    </section>
  );
}

function pendingHintOf(pending?: number): string | undefined {
  if (pending === undefined) return undefined;
  return `${formatCount(pending)} ${pending === 1 ? 'pendente' : 'pendentes'} de revisão`;
}

/** Indicadores do frame 208-2895 (CCD105, R7 e L8): álbuns, licenciados e pendentes de revisão. */
export function CatalogStats({ summary }: { summary?: CatalogSummary }) {
  return (
    <div className={styles.stats}>
      <StatCard label="Total de álbuns" value={summary?.albums} icon="menuBook" />
      <StatCard
        label="Álbuns licenciados"
        value={summary?.licensedAlbums}
        hint={pendingHintOf(summary?.pendingAlbumRequests)}
        icon="checkCircle"
      />
    </div>
  );
}
