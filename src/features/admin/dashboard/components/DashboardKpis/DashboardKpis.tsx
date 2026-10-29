import { KpiCard } from '@/components/KpiCard/KpiCard';

import type { DashboardKpis as Kpis } from '../../dashboard.types';
import styles from './DashboardKpis.module.css';

interface DashboardKpisProps {
  kpis: Kpis;
}

const numberFormatter = new Intl.NumberFormat('pt-BR');

const formatCount = (value: number | null) =>
  value === null ? '—' : numberFormatter.format(value);

export function DashboardKpis({ kpis }: DashboardKpisProps) {
  const cardsHint = kpis.totalCards === null ? 'Disponível com o catálogo' : 'No catálogo';

  return (
    <div className={styles.kpis}>
      <KpiCard
        label="Total de usuários"
        value={formatCount(kpis.totalUsers)}
        hint="Clientes e vendedores"
      />
      <KpiCard label="Cartas cadastradas" value={formatCount(kpis.totalCards)} hint={cardsHint} />
      <KpiCard label="Novos cadastros" value={formatCount(kpis.newUsers)} hint="No período" />
      <KpiCard label="Novos vendedores" value={formatCount(kpis.newSellers)} hint="No período" />
    </div>
  );
}
