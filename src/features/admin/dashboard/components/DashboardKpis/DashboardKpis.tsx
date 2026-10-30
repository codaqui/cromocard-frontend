import arrowIcon from '../../assets/arrow-forward.svg';
import { formatCount } from '../../dashboard.format';
import type { DashboardKpis as Kpis, MonthlySignups } from '../../dashboard.types';
import styles from './DashboardKpis.module.css';
import { KpiTile, type KpiTileProps } from './KpiTile';
import { Sparkline } from './Sparkline';

export const RECENT_SELLERS_ANCHOR = 'vendedores-recentes';

interface DashboardKpisProps {
  kpis: Kpis;
  signups: MonthlySignups[];
}

function RoleSplit({ customers, sellers }: { customers: number; sellers: number }) {
  return (
    <>
      <div>
        <p className={styles.footerLabel}>Novos clientes</p>
        <p className={styles.footerValue}>{formatCount(customers)}</p>
      </div>
      <span className={styles.divider} aria-hidden="true" />
      <div className={styles.alignEnd}>
        <p className={styles.footerAccent}>Novos vendedores</p>
        <p className={styles.footerValueAccent}>{formatCount(sellers)}</p>
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

function catalogTiles(kpis: Kpis): KpiTileProps[] {
  const cardsPending = kpis.totalCards === null;
  return [
    {
      label: 'Total de usuários',
      value: formatCount(kpis.totalUsers),
      unit: 'ativos',
      description: 'Clientes e vendedores com conta ativa na plataforma.',
      glow: 'primary',
      footer: <RoleSplit customers={kpis.newUsers - kpis.newSellers} sellers={kpis.newSellers} />,
    },
    {
      label: 'Cartas cadastradas',
      value: formatCount(kpis.totalCards),
      unit: cardsPending ? undefined : 'cartas',
      description: cardsPending ? 'Disponível com o catálogo' : 'Cartas do catálogo global.',
      glow: 'accent',
    },
  ];
}

function periodTiles(kpis: Kpis, signups: MonthlySignups[]): KpiTileProps[] {
  return [
    {
      label: 'Novos cadastros',
      value: `+${formatCount(kpis.newUsers)}`,
      description: 'Clientes e vendedores cadastrados no período selecionado.',
      glow: 'warning',
      aside: <Sparkline signups={signups} />,
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
