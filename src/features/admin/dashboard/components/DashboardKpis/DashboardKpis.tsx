import arrowIcon from '../../assets/arrow-forward.svg';
import { formatCount, formatShare } from '../../dashboard.format';
import type { DashboardKpis as Kpis, MonthlySignups } from '../../dashboard.types';
import styles from './DashboardKpis.module.css';
import { KpiTile, type KpiTileProps } from './KpiTile';
import { Sparkline } from './Sparkline';

export const RECENT_SELLERS_ANCHOR = 'vendedores-recentes';

interface DashboardKpisProps {
  kpis: Kpis;
  signups: MonthlySignups[];
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

function SingleMetric({ label, value }: Metric) {
  return (
    <>
      <p className={styles.footerText}>{label}</p>
      <p className={styles.footerHighlight}>{value}</p>
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

const signupsIn = ({ customers, sellers }: MonthlySignups) => customers + sellers;

function cardsPerUser({ totalCards, totalUsers }: Kpis): string {
  if (totalCards === null || totalUsers === 0) return '—';
  return formatCount(Math.round(totalCards / totalUsers));
}

function usersTile(kpis: Kpis): KpiTileProps {
  return {
    label: 'Total de usuários',
    value: formatCount(kpis.totalUsers),
    unit: 'ativos',
    description: 'Clientes e vendedores com conta ativa na plataforma.',
    glow: 'primary',
    footer: (
      <MetricPair
        start={{ label: 'Novos clientes', value: formatCount(kpis.newUsers - kpis.newSellers) }}
        end={{ label: 'Novos vendedores', value: formatCount(kpis.newSellers) }}
      />
    ),
  };
}

function cardsTile(kpis: Kpis): KpiTileProps {
  const cardsPending = kpis.totalCards === null;
  return {
    label: 'Cartas cadastradas',
    value: formatCount(kpis.totalCards),
    unit: cardsPending ? undefined : 'cartas',
    badge: 'Catálogo global',
    description: cardsPending
      ? 'A contagem aparece quando o catálogo estiver no ar.'
      : 'Cartas do catálogo global, sem contar as excluídas.',
    glow: 'accent',
    footer: <SingleMetric label="Cartas por usuário" value={cardsPerUser(kpis)} />,
  };
}

const catalogTiles = (kpis: Kpis): KpiTileProps[] => [usersTile(kpis), cardsTile(kpis)];

function periodFooter(signups: MonthlySignups[]) {
  const total = signups.reduce((sum, month) => sum + signupsIn(month), 0);
  const average = signups.length ? Math.round(total / signups.length) : 0;
  const current = signups.at(-1);

  return (
    <MetricPair
      start={{ label: 'Média mensal', value: formatCount(average) }}
      end={{ label: 'Mês atual', value: formatCount(current ? signupsIn(current) : 0) }}
    />
  );
}

function periodTiles(kpis: Kpis, signups: MonthlySignups[]): KpiTileProps[] {
  return [
    {
      label: 'Novos cadastros',
      value: `+${formatCount(kpis.newUsers)}`,
      badge: `${formatShare(kpis.newSellers, kpis.newUsers)} vendedores`,
      badgeTone: 'warning',
      description: 'Clientes e vendedores cadastrados no período selecionado.',
      glow: 'warning',
      aside: <Sparkline signups={signups} />,
      footer: periodFooter(signups),
    },
    {
      label: 'Novos vendedores',
      value: formatCount(kpis.newSellers),
      unit: 'no período',
      description: 'Vendedores que criaram conta no período selecionado.',
      glow: 'primary',
      footer: <SellersLink />,
    },
  ];
}

export function DashboardKpis({ kpis, signups }: DashboardKpisProps) {
  const tiles = [...catalogTiles(kpis), ...periodTiles(kpis, signups)];

  return (
    <div className={styles.kpis}>
      {tiles.map((tile) => (
        <KpiTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
