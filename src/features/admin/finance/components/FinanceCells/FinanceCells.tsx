import { cn } from '@/utils/cn';

import {
  activeListingsLabel,
  activeNegotiationsLabel,
  formatCurrency,
  formatPopulation,
  formatWholeCurrency,
} from '../../finance.format';
import type { CardFinanceStats, GroupFinanceStats, SellerFinanceStats } from '../../finance.types';
import styles from './FinanceCells.module.css';

const NO_DATA = '—';

export function ListedVolumeCell({ stats }: { stats?: SellerFinanceStats }) {
  if (!stats) return <span className={styles.muted}>{NO_DATA}</span>;

  return (
    <div className={styles.stack}>
      <span className={styles.amount}>{formatWholeCurrency(stats.listedVolumeCents)}</span>
      <span className={styles.caption}>{activeListingsLabel(stats.activeListings)}</span>
    </div>
  );
}

export function PopulationCell({ stats }: { stats?: CardFinanceStats }) {
  return (
    <span className={styles.mono}>{stats ? formatPopulation(stats.population) : NO_DATA}</span>
  );
}

export function AveragePriceCell({ stats }: { stats?: CardFinanceStats }) {
  if (stats?.averagePriceCents == null) return <span className={styles.muted}>{NO_DATA}</span>;

  return (
    <div className={cn(styles.stack, styles.end)}>
      <span className={styles.mono}>{formatCurrency(stats.averagePriceCents)}</span>
      <span className={styles.window}>média 30 dias</span>
    </div>
  );
}

export function GroupVolumeCell({ stats }: { stats?: GroupFinanceStats }) {
  if (!stats) return <span className={styles.muted}>{NO_DATA}</span>;
  const idle = stats.activeNegotiations === 0;

  return (
    <div className={cn(styles.stack, idle && styles.idle)}>
      <span className={styles.volume}>{formatCurrency(stats.negotiatedVolumeCents)}</span>
      <span className={styles.negotiations}>
        {activeNegotiationsLabel(stats.activeNegotiations)}
      </span>
    </div>
  );
}
