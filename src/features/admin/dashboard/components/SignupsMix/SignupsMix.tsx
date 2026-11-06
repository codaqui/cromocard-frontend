import { useId } from 'react';

import { cn } from '@/utils/cn';

import { formatCount, formatShare } from '../../dashboard.format';
import type { DashboardKpis } from '../../dashboard.types';
import styles from './SignupsMix.module.css';

interface MixRowProps {
  label: string;
  count: number;
  total: number;
  tone: 'customers' | 'sellers';
}

function MixRow({ label, count, total, tone }: MixRowProps) {
  const share = formatShare(count, total);

  return (
    <li className={styles.row}>
      <div className={styles.rowText}>
        <span>{label}</span>
        <span className={styles.rowValue}>
          {formatCount(count)} · {share}
        </span>
      </div>
      <span className={styles.track} aria-hidden="true">
        <span className={cn(styles.bar, styles[tone])} style={{ width: share }} />
      </span>
    </li>
  );
}

export function SignupsMix({ kpis }: { kpis: DashboardKpis }) {
  const titleId = useId();
  const customers = kpis.newUsers - kpis.newSellers;

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <header className={styles.heading}>
        <h2 id={titleId} className={styles.label}>
          Composição dos cadastros
        </h2>
        <span className={styles.badge}>No período</span>
      </header>
      <p className={styles.value}>
        {formatShare(customers, kpis.newUsers)}
        <span className={styles.unit}> clientes</span>
      </p>
      <p className={styles.description}>
        Proporção de clientes e vendedores entre os novos cadastros do período selecionado.
      </p>
      <ul className={styles.rows}>
        <MixRow label="Clientes" count={customers} total={kpis.newUsers} tone="customers" />
        <MixRow label="Vendedores" count={kpis.newSellers} total={kpis.newUsers} tone="sellers" />
      </ul>
    </section>
  );
}
