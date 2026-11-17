import { useSignupsEvolution } from '../../dashboard.queries';
import type { DashboardPeriodParams } from '../../dashboard.types';
import { smoothLine } from '../SignupsEvolutionChart/chart-geometry';
import styles from './DashboardKpis.module.css';

const WIDTH = 96;
const HEIGHT = 40;
const INSET = 2;

function toPoints(totals: number[]) {
  const highest = Math.max(1, ...totals);
  const step = (WIDTH - INSET * 2) / (totals.length - 1);
  return totals.map((total, index) => ({
    x: INSET + index * step,
    y: HEIGHT - INSET - (total / highest) * (HEIGHT - INSET * 2),
  }));
}

export function Sparkline({ params }: { params: DashboardPeriodParams }) {
  const { data } = useSignupsEvolution(params);
  const totals = data?.points.map(({ collectors, sellers }) => collectors + sellers) ?? [];
  if (totals.length < 2) return null;

  return (
    <svg
      className={styles.sparkline}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
    >
      <path className={styles.sparklineLine} d={smoothLine(toPoints(totals))} />
    </svg>
  );
}
