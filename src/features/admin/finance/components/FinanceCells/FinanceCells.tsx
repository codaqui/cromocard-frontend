import { cn } from '@/utils/cn';

import {
  activeListingsLabel,
  activeNegotiationsLabel,
  formatCurrency,
  formatPopulation,
  formatRating,
  formatWholeCurrency,
} from '../../finance.format';
import type { CardFinanceStats, GroupFinanceStats, SellerFinanceStats } from '../../finance.types';
import styles from './FinanceCells.module.css';

const STARS = 5;
const NO_DATA = '—';

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);

  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: STARS }, (_, index) => (
        <span key={index} className={cn(index < filled && styles.filled)}>
          {index < filled ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export function ReputationCell({ stats }: { stats?: SellerFinanceStats }) {
  if (!stats) return <span className={styles.muted}>{NO_DATA}</span>;
  const rating = formatRating(stats.rating);

  return (
    <span
      className={styles.reputation}
      aria-label={`Nota ${rating} de ${STARS}, ${stats.reviews} avaliações`}
    >
      <Stars rating={stats.rating ?? 0} />
      <span className={styles.rating}>{rating}</span>
    </span>
  );
}

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
