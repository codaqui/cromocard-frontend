import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { type Period, PeriodFilter } from '@/components/PeriodFilter/PeriodFilter';
import { paths } from '@/routes/paths';

import { DashboardKpis } from '../../components/DashboardKpis/DashboardKpis';
import { RecentSellersTable } from '../../components/RecentSellersTable/RecentSellersTable';
import { SignupsChart } from '../../components/SignupsChart/SignupsChart';
import { DEFAULT_DASHBOARD_PERIOD, toPeriodParams } from '../../dashboard.period';
import { useDashboardSummary, useRecentSellers } from '../../dashboard.queries';
import type { DashboardPeriodParams, DashboardSummary } from '../../dashboard.types';
import styles from './DashboardPage.module.css';

const RECENT_SELLERS_PAGE_SIZE = 5;

interface LoadErrorProps {
  message: string;
  onRetry: () => void;
}

function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div className={styles.error}>
      <ErrorState message={message} />
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}

interface SellersPaging {
  params: DashboardPeriodParams;
  page: number;
  onPageChange: (page: number) => void;
}

function RecentSellers({ params, page, onPageChange }: SellersPaging) {
  const query = useRecentSellers({ ...params, page, pageSize: RECENT_SELLERS_PAGE_SIZE });

  if (query.isPending) return <LoadingState message="Carregando vendedores…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return (
    <RecentSellersTable
      sellers={query.data.data}
      meta={query.data.meta}
      onPageChange={onPageChange}
    />
  );
}

interface DashboardDataProps {
  summary: DashboardSummary;
  sellers: SellersPaging;
}

function DashboardData({ summary, sellers }: DashboardDataProps) {
  if (summary.isEmpty) return <EmptyState title="Não existem dados para apresentação" />;

  return (
    <>
      <DashboardKpis kpis={summary.kpis} />
      {summary.kpis.newUsers === 0 ? (
        <EmptyState title="Não foram encontrados dados para os filtros selecionados" />
      ) : (
        <SignupsChart signups={summary.signupsByMonth} />
      )}
      <RecentSellers {...sellers} />
    </>
  );
}

function DashboardContent(sellers: SellersPaging) {
  const query = useDashboardSummary(sellers.params);

  if (query.isPending) return <LoadingState message="Carregando o dashboard…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return <DashboardData summary={query.data} sellers={sellers} />;
}

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>(DEFAULT_DASHBOARD_PERIOD);
  const [sellersPage, setSellersPage] = useState(1);

  const changePeriod = (next: Period) => {
    setPeriod(next);
    setSellersPage(1);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <Link to={paths.backoffice.reports} className={styles.export}>
          Exportar Dados
        </Link>
      </header>
      <PeriodFilter value={period} onChange={changePeriod} />
      <DashboardContent
        params={toPeriodParams(period)}
        page={sellersPage}
        onPageChange={setSellersPage}
      />
    </section>
  );
}
