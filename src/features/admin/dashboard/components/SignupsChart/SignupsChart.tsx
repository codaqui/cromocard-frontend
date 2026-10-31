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

const VISIBLE_MONTHS = 7;
const HEADROOM = 1.4;

const lastMonths = (signups: MonthlySignups[]) => signups.slice(-VISIBLE_MONTHS);

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

  return (
    <g>
      <path d={areaUnder(points)} fill={`url(#${fillId})`} />
      <path d={smoothLine(points)} className={styles[`${tone}Line`]} />
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r={12} className={styles[`${tone}Halo`]} />
          <circle cx={last.x} cy={last.y} r={6} className={styles[`${tone}Dot`]} />
        </>
      )}
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

function Baseline() {
  return (
    <line x1={0} x2={CHART_WIDTH} y1={CHART_HEIGHT} y2={CHART_HEIGHT} className={styles.baseline} />
  );
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
      <Baseline />
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

const monthsLabel = (count: number) => (count === 1 ? 'último mês' : `últimos ${count} meses`);

export function SignupsChart({ signups: periodSignups }: SignupsChartProps) {
  const signups = lastMonths(periodSignups);

  return (
    <figure className={styles.chart}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Evolução Mensal: Novos Cadastros vs Vendedores</h2>
          <p className={styles.subtitle}>
            Clientes e vendedores cadastrados por mês no {monthsLabel(signups.length)} do período.
          </p>
        </div>
        <Legend signups={signups} />
      </header>
      <Plot signups={signups} />
      <MonthLabels signups={signups} />
    </figure>
  );
}
