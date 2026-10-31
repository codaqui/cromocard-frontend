import { Link } from 'react-router';

import { type Period, PeriodFilter } from '@/components/PeriodFilter/PeriodFilter';
import { paths } from '@/routes/paths';

import analyticsIcon from '../../assets/analytics.svg';
import calendarIcon from '../../assets/calendar.svg';
import downloadIcon from '../../assets/download.svg';
import { formatPeriodRange } from '../../dashboard.format';
import { useDashboardSummary } from '../../dashboard.queries';
import type { DashboardPeriodParams } from '../../dashboard.types';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  period: Period;
  params: DashboardPeriodParams;
  onPeriodChange: (period: Period) => void;
}

function PeriodRange({ params }: { params: DashboardPeriodParams }) {
  const { data } = useDashboardSummary(params);
  if (!data) return null;

  return (
    <p className={styles.range}>
      <img src={calendarIcon} alt="" width={13.5} height={15} />
      {formatPeriodRange(data.period.from, data.period.to)}
    </p>
  );
}

function Identity() {
  return (
    <div className={styles.identity}>
      <span className={styles.badgeIcon}>
        <img src={analyticsIcon} alt="" width={19.5} height={19.5} />
      </span>
      <div>
        <h1 className={styles.title}>Visão Executiva &amp; Gerencial</h1>
        <p className={styles.subtitle}>
          Consolidado de usuários, novos cadastros e vendedores da plataforma.
        </p>
      </div>
    </div>
  );
}

export function DashboardHeader({ period, params, onPeriodChange }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <Identity />
      <div className={styles.controls}>
        <PeriodFilter value={period} onChange={onPeriodChange} />
        <div className={styles.actions}>
          <PeriodRange params={params} />
          <Link to={paths.backoffice.reports} className={styles.export}>
            <img src={downloadIcon} alt="" width={12} height={12} />
            Exportar Dados
          </Link>
        </div>
      </div>
    </header>
  );
}
