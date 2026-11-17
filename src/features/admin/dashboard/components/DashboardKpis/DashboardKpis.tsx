import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import arrowIcon from '../../assets/arrow-forward.svg';
import { formatCount, formatVariation } from '../../dashboard.format';
import type {
  DashboardPeriodParams,
  DashboardSummary,
  DashboardKpis as Kpis,
  SignupGoal,
} from '../../dashboard.types';
import styles from './DashboardKpis.module.css';
import { KpiTile, type KpiTileProps } from './KpiTile';
import { Sparkline } from './Sparkline';

export const RECENT_SELLERS_ANCHOR = 'vendedores-recentes';

const FULL_GOAL_PERCENT = 100;

interface DashboardKpisProps {
  summary: DashboardSummary;
  period: Period;
  params: DashboardPeriodParams;
}

interface Metric {
  label: string;
  value: string;
}

function MetricPair({ start, end }: { start: Metric; end: Metric }) {
  return (
    <>
      <div>
        <p className={styles.footerLabel}>{start.label}</p>
        <p className={styles.footerValue}>{start.value}</p>
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.alignEnd}>
        <p className={styles.footerAccent}>{end.label}</p>
        <p className={styles.footerValueAccent}>{end.value}</p>
      </div>
    </>
  );
}

function SellersLink() {
  return (
    <>
      <p className={styles.footerText}>Cadastros recentes</p>
      <a href={`#${RECENT_SELLERS_ANCHOR}`} className={styles.footerLink}>
        Ver lista
        <img src={arrowIcon} alt="" width={9.33} height={9.33} />
      </a>
    </>
  );
}

function usersTile(kpis: Kpis): KpiTileProps {
  return {
    label: 'Total de usuários',
    value: formatCount(kpis.totalUsers),
    unit: 'usuários',
    badge: formatVariation(kpis.usersVariation),
    badgeTone: (kpis.usersVariation ?? 0) < 0 ? 'warning' : 'info',
    description: 'Clientes e vendedores, sem administradores e sem contas excluídas.',
    glow: 'primary',
    footer: (
      <MetricPair
        start={{ label: 'Colecionadores', value: formatCount(kpis.collectors) }}
        end={{ label: 'Lojistas', value: formatCount(kpis.sellers) }}
      />
    ),
  };
}

function cardsTile(kpis: Kpis): KpiTileProps {
  const catalogOn = kpis.totalCards !== null;
  return {
    label: 'Cartas no catálogo',
    value: formatCount(kpis.totalCards),
    unit: catalogOn ? 'cartas' : undefined,
    description: catalogOn
      ? `+${formatCount(kpis.newCardsThisWeek)} novas cartas esta semana`
      : 'A contagem aparece quando o catálogo estiver no ar.',
    descriptionTone: catalogOn ? 'accent' : undefined,
    glow: 'accent',
  };
}

const presetDescription = {
  today: 'Novos cadastros hoje.',
  '7d': 'Novos cadastros nos últimos 7 dias.',
  '1y': 'Novos cadastros nos últimos 12 meses.',
};

function goalDescription(goal: SignupGoal | null): string {
  if (!goal) return 'Meta mensal não configurada.';
  const monthly = `Meta mensal de ${formatCount(goal.monthly)} cadastros`;
  if ((goal.percent ?? 0) > FULL_GOAL_PERCENT) return `${monthly} superada.`;
  return goal.percent === FULL_GOAL_PERCENT ? `${monthly} atingida.` : `${monthly}.`;
}

function signupsDescription({ kpis, goal }: DashboardSummary, period: Period): string {
  if (kpis.newUsers === 0) return 'Nenhum cadastro no período.';
  if (!('preset' in period)) return 'Novos cadastros no período selecionado.';
  if (period.preset === '30d') return goalDescription(goal);
  return presetDescription[period.preset];
}

function signupsTile({ summary, period, params }: DashboardKpisProps): KpiTileProps {
  const percent = summary.goal?.percent ?? null;
  const { newUsers } = summary.kpis;
  return {
    label: 'Novos cadastros',
    value: newUsers === 0 ? '0' : `+${formatCount(newUsers)}`,
    badge: percent === null ? undefined : `${formatCount(percent)}% da Meta`,
    badgeTone: 'warning',
    description: signupsDescription(summary, period),
    glow: 'warning',
    aside: <Sparkline params={params} />,
  };
}

function sellersTile(kpis: Kpis): KpiTileProps {
  return {
    label: 'Novos vendedores',
    value: formatCount(kpis.newSellers),
    unit: 'no período',
    description: 'Vendedores que criaram conta no período selecionado.',
    glow: 'primary',
    footer: <SellersLink />,
  };
}

export function DashboardKpis(props: DashboardKpisProps) {
  const { kpis } = props.summary;
  const tiles = [usersTile(kpis), cardsTile(kpis), signupsTile(props), sellersTile(kpis)];

  return (
    <div className={styles.kpis}>
      {tiles.map((tile) => (
        <KpiTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
