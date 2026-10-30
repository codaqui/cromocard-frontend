import { useId } from 'react';

import { formatCount, monthName, shortMonthLabel } from '../../dashboard.format';
import type { MonthlySignups } from '../../dashboard.types';
import {
  areaUnder,
  CHART_HEIGHT,
  CHART_WIDTH,
  type ChartPoint,
  smoothLine,
  toChartPoints,
} from './chart-geometry';
import styles from './SignupsChart.module.css';

interface SignupsChartProps {
  signups: MonthlySignups[];
}

const GRID_LINES = [0.25, 0.5, 0.75];
const HEADROOM = 1.4;

function describeSignups(signups: MonthlySignups[]): string {
  const parts = signups.map(
    ({ month, customers, sellers }) =>
      `${shortMonthLabel(month)}: ${customers} clientes e ${sellers} vendedores`,
  );
  return `Novos cadastros por mês. ${parts.join('; ')}.`;
}

const currentMonth = () => new Date().toISOString().slice(0, 7);

interface SeriesProps {
  points: ChartPoint[];
  fillId: string;
  tone: 'customers' | 'sellers';
}

function Series({ points, fillId, tone }: SeriesProps) {
  const last = points.at(-1);
  const dots = tone === 'customers' ? points : last ? [last] : [];

  return (
    <g>
      <path d={areaUnder(points)} fill={`url(#${fillId})`} />
      <path d={smoothLine(points)} className={styles[`${tone}Line`]} />
      {dots.map(({ x, y }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={5} className={styles[`${tone}Dot`]} />
      ))}
    </g>
  );
}

function Gradient({ id, tone }: { id: string; tone: 'customers' | 'sellers' }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" className={styles[`${tone}FillStart`]} />
      <stop offset="1" className={styles.fillEnd} />
    </linearGradient>
  );
}

function GridLines() {
  return GRID_LINES.map((ratio) => (
    <line
      key={ratio}
      x1={0}
      x2={CHART_WIDTH}
      y1={CHART_HEIGHT * ratio}
      y2={CHART_HEIGHT * ratio}
      className={styles.grid}
    />
  ));
}

function seriesPoints(signups: MonthlySignups[]) {
  const peak = Math.max(1, ...signups.flatMap(({ customers, sellers }) => [customers, sellers]));
  const highest = peak * HEADROOM;
  return {
    customers: toChartPoints(
      signups.map(({ customers }) => customers),
      highest,
    ),
    sellers: toChartPoints(
      signups.map(({ sellers }) => sellers),
      highest,
    ),
  };
}

function Plot({ signups }: SignupsChartProps) {
  const gradientId = useId();
  const { customers, sellers } = seriesPoints(signups);

  return (
    <svg
      role="img"
      aria-label={describeSignups(signups)}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className={styles.svg}
    >
      <defs>
        <Gradient id={`${gradientId}-customers`} tone="customers" />
        <Gradient id={`${gradientId}-sellers`} tone="sellers" />
      </defs>
      <GridLines />
      <Series points={customers} fillId={`${gradientId}-customers`} tone="customers" />
      <Series points={sellers} fillId={`${gradientId}-sellers`} tone="sellers" />
    </svg>
  );
}

function Legend({ signups }: SignupsChartProps) {
  const customers = signups.reduce((total, signup) => total + signup.customers, 0);
  const sellers = signups.reduce((total, signup) => total + signup.sellers, 0);

  return (
    <ul className={styles.legend}>
      <li className={styles.legendItem}>
        <span className={styles.customersSwatch} aria-hidden="true" />
        Clientes (+{formatCount(customers)})
      </li>
      <li className={styles.legendSellers}>
        <span className={styles.sellersSwatch} aria-hidden="true" />
        Vendedores (+{formatCount(sellers)})
      </li>
    </ul>
  );
}

function MonthLabels({ signups }: SignupsChartProps) {
  const thisMonth = currentMonth();

  return (
    <ol className={styles.months} aria-hidden="true">
      {signups.map(({ month }) => (
        <li key={month} className={month === thisMonth ? styles.currentMonth : undefined}>
          {monthName(month)}
          {month === thisMonth && ' (atual)'}
        </li>
      ))}
    </ol>
  );
}

export function SignupsChart({ signups }: SignupsChartProps) {
  return (
    <figure className={styles.chart}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Evolução Mensal: Novos Cadastros vs Vendedores</h2>
          <p className={styles.subtitle}>
            Clientes e vendedores cadastrados a cada mês do período selecionado.
          </p>
        </div>
        <Legend signups={signups} />
      </header>
      <Plot signups={signups} />
      <MonthLabels signups={signups} />
    </figure>
  );
}
