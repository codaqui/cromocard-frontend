import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader';
import { DashboardKpis } from '../../components/DashboardKpis/DashboardKpis';
import { RecentSellersTable } from '../../components/RecentSellersTable/RecentSellersTable';
import { SignupsEvolutionChart } from '../../components/SignupsEvolutionChart/SignupsEvolutionChart';
import { SignupsMix } from '../../components/SignupsMix/SignupsMix';
import { DEFAULT_DASHBOARD_PERIOD, toPeriodParams } from '../../dashboard.period';
import {
  useDashboardSummary,
  useRecentSellers,
  useSignupsEvolution,
} from '../../dashboard.queries';
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

interface PeriodSelection {
  params: DashboardPeriodParams;
  period: Period;
}

function SignupsEvolution({ params, period }: PeriodSelection) {
  const query = useSignupsEvolution(params);

  if (query.isPending) return <LoadingState message="Carregando a evolução dos cadastros…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return <SignupsEvolutionChart evolution={query.data} period={period} />;
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
      onRefresh={() => void query.refetch()}
    />
  );
}

interface DashboardDataProps {
  summary: DashboardSummary;
  sellers: SellersPaging;
  period: Period;
}

function DashboardData({ summary, sellers, period }: DashboardDataProps) {
  if (summary.isEmpty) return <EmptyState title="Não existem dados para apresentação" />;

  return (
    <>
      <DashboardKpis kpis={summary.kpis} signups={summary.signupsByMonth} />
      <div className={styles.insights}>
        <SignupsEvolution params={sellers.params} period={period} />
        <SignupsMix kpis={summary.kpis} />
      </div>
      <RecentSellers {...sellers} />
    </>
  );
}

function DashboardContent({ period, ...sellers }: SellersPaging & { period: Period }) {
  const query = useDashboardSummary(sellers.params);

  if (query.isPending) return <LoadingState message="Carregando o dashboard…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return <DashboardData summary={query.data} sellers={sellers} period={period} />;
}

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>(DEFAULT_DASHBOARD_PERIOD);
  const [sellersPage, setSellersPage] = useState(1);
  const params = toPeriodParams(period);

  const changePeriod = (next: Period) => {
    setPeriod(next);
    setSellersPage(1);
  };

  return (
    <section className={styles.page}>
      <DashboardHeader period={period} params={params} onPeriodChange={changePeriod} />
      <DashboardContent
        params={params}
        period={period}
        page={sellersPage}
        onPageChange={setSellersPage}
      />
    </section>
  );
}
