import type { MonthlySignups } from '../../dashboard.types';
import styles from './DashboardKpis.module.css';

const WIDTH = 96;
const HEIGHT = 40;
const INSET = 2;

function toPoints(totals: number[]): string {
  const highest = Math.max(1, ...totals);
  const step = (WIDTH - INSET * 2) / (totals.length - 1);
  return totals
    .map((total, index) => {
      const x = INSET + index * step;
      const y = HEIGHT - INSET - (total / highest) * (HEIGHT - INSET * 2);
      return `${x},${y}`;
    })
    .join(' ');
}

export function Sparkline({ signups }: { signups: MonthlySignups[] }) {
  if (signups.length < 2) return null;

  const totals = signups.map(({ customers, sellers }) => customers + sellers);

  return (
    <svg
      className={styles.sparkline}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
    >
      <polyline className={styles.sparklineLine} points={toPoints(totals)} />
    </svg>
  );
}
