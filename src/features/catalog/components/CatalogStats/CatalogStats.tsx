import { useId } from 'react';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { formatCount } from '../../catalog.format';
import type { CatalogTotals } from '../../hooks/useCatalogTotals';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogStats.module.css';

interface StatCardProps {
  label: string;
  value?: number;
  hint: string;
  icon: CatalogIconName;
  tone: 'accent' | 'warning';
}

function StatCard({ label, value, hint, icon, tone }: StatCardProps) {
  const labelId = useId();

  return (
    <section className={styles.card} aria-labelledby={labelId}>
      <div>
        <h2 id={labelId} className={styles.label}>
          {label}
        </h2>
        <p className={styles.value}>{formatCount(value)}</p>
        <p className={styles[tone]}>{hint}</p>
      </div>
      <span className={styles.icon}>
        <CatalogIcon name={icon} size={20} />
      </span>
    </section>
  );
}

export function CatalogStats({ totals }: { totals: CatalogTotals }) {
  return (
    <div className={styles.stats}>
      <StatCard
        label="Total de cartas"
        value={totals.cards}
        hint="cartas ativas no catálogo global"
        icon="menuBook"
        tone="accent"
      />
      <StatCard
        label="Álbuns oficiais"
        value={totals.albums}
        hint={`${formatCount(totals.categories)} categorias & franquias`}
        icon="libraryAdd"
        tone="warning"
      />
    </div>
  );
}
