import type { MonthlySignups } from '../../dashboard.types';
import styles from './SignupsChart.module.css';

interface SignupsChartProps {
  signups: MonthlySignups[];
}

const CHART_HEIGHT = 160;
const LABEL_HEIGHT = 24;
const BAR_WIDTH = 14;
const GROUP_WIDTH = 48;

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
});

function monthLabel(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`)).replace(' de ', '/');
}

function describe(signups: MonthlySignups[]): string {
  const parts = signups.map(
    ({ month, customers, sellers }) =>
      `${monthLabel(month)}: ${customers} clientes e ${sellers} vendedores`,
  );
  return `Novos cadastros por mês. ${parts.join('; ')}.`;
}

interface MonthBarsProps {
  signup: MonthlySignups;
  index: number;
  scale: number;
}

interface BarProps {
  x: number;
  height: number;
  className?: string;
}

function Bar({ x, height, className }: BarProps) {
  return (
    <rect
      className={className}
      x={x}
      y={CHART_HEIGHT - height}
      width={BAR_WIDTH}
      height={height}
      rx={3}
    />
  );
}

function MonthBars({ signup, index, scale }: MonthBarsProps) {
  const x = index * GROUP_WIDTH + (GROUP_WIDTH - BAR_WIDTH * 2) / 2;

  return (
    <g>
      <Bar x={x} height={signup.customers * scale} className={styles.customers} />
      <Bar x={x + BAR_WIDTH} height={signup.sellers * scale} className={styles.sellers} />
      <text
        className={styles.label}
        x={index * GROUP_WIDTH + GROUP_WIDTH / 2}
        y={CHART_HEIGHT + 16}
      >
        {monthLabel(signup.month)}
      </text>
    </g>
  );
}

function Legend() {
  return (
    <figcaption className={styles.legend}>
      <span className={styles.legendItem}>
        <span className={styles.customersSwatch} aria-hidden="true" /> Clientes
      </span>
      <span className={styles.legendItem}>
        <span className={styles.sellersSwatch} aria-hidden="true" /> Vendedores
      </span>
    </figcaption>
  );
}

export function SignupsChart({ signups }: SignupsChartProps) {
  const highest = Math.max(1, ...signups.flatMap(({ customers, sellers }) => [customers, sellers]));
  const width = Math.max(signups.length, 1) * GROUP_WIDTH;

  return (
    <figure className={styles.chart}>
      <h2 className={styles.title}>Novos cadastros por mês</h2>
      <svg
        role="img"
        aria-label={describe(signups)}
        viewBox={`0 0 ${width} ${CHART_HEIGHT + LABEL_HEIGHT}`}
        className={styles.svg}
      >
        {signups.map((signup, index) => (
          <MonthBars
            key={signup.month}
            signup={signup}
            index={index}
            scale={CHART_HEIGHT / highest}
          />
        ))}
      </svg>
      <Legend />
    </figure>
  );
}
