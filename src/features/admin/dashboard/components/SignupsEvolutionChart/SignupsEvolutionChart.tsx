import { useId } from 'react';

import type { Period } from '@/components/PeriodFilter/PeriodFilter';
import { cn } from '@/utils/cn';

import { formatCount } from '../../dashboard.format';
import type { EvolutionTotals, SignupsEvolution } from '../../dashboard.types';
import { axisLabels, evolutionSubtitle } from './evolution-labels';
import { EvolutionPlot } from './EvolutionPlot';
import styles from './SignupsEvolutionChart.module.css';

export const EVOLUTION_TITLE = 'Evolução: Novos Cadastros vs Lojistas Certificados';
export const NO_SIGNUPS_MESSAGE = 'Não há cadastros no período.';

interface SignupsEvolutionChartProps {
  evolution: SignupsEvolution;
  period: Period;
  now?: Date;
}

function Legend({ totals }: { totals: EvolutionTotals }) {
  return (
    <ul className={styles.legend}>
      <li className={styles.legendItem}>
        <span className={styles.collectorsSwatch} aria-hidden="true" />
        Colecionadores (+{formatCount(totals.collectors)})
      </li>
      <li className={cn(styles.legendItem, styles.legendSellers)}>
        <span className={styles.sellersSwatch} aria-hidden="true" />
        Lojistas (+{formatCount(totals.sellers)})
      </li>
    </ul>
  );
}

function AxisLabels({ evolution, now }: { evolution: SignupsEvolution; now: Date }) {
  const labels = axisLabels(evolution.points, evolution.bucket, now);
  const lastIndex = Math.max(1, evolution.points.length - 1);

  return (
    <ol className={styles.axis} aria-hidden="true">
      {labels.map(({ index, text, current }) => (
        <li
          key={index}
          className={cn(styles.axisLabel, current && styles.currentLabel)}
          style={{ left: `${(index / lastIndex) * 100}%` }}
        >
          {text}
        </li>
      ))}
    </ol>
  );
}

interface HeaderProps {
  titleId: string;
  subtitle: string;
  totals: EvolutionTotals;
}

function Header({ titleId, subtitle, totals }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h2 id={titleId} className={styles.title}>
          {EVOLUTION_TITLE}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <Legend totals={totals} />
    </header>
  );
}

const hasSignups = ({ collectors, sellers }: EvolutionTotals) => collectors + sellers > 0;

export function SignupsEvolutionChart({
  evolution,
  period,
  now = new Date(),
}: SignupsEvolutionChartProps) {
  const titleId = useId();

  return (
    <section className={styles.chart} aria-labelledby={titleId}>
      <Header
        titleId={titleId}
        subtitle={evolutionSubtitle(period, evolution.bucket)}
        totals={evolution.totals}
      />
      {hasSignups(evolution.totals) ? (
        <div>
          <EvolutionPlot points={evolution.points} bucket={evolution.bucket} />
          <AxisLabels evolution={evolution} now={now} />
        </div>
      ) : (
        <p className={styles.empty}>{NO_SIGNUPS_MESSAGE}</p>
      )}
    </section>
  );
}
