import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import type { Period } from '@/components/PeriodFilter/PeriodFilter';
import {
  SellerRegistrationsTable,
  SellerVerificationPanel,
  useSellerVerificationDrawer,
  useSellerVerificationsList,
  useSellerVerificationsSummary,
} from '@/features/admin';
import type { SellerVerificationListItem } from '@/features/admin';
import type { SellerVerificationStatus } from '@/types/seller-verification';

import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader';
import { DashboardKpis } from '../../components/DashboardKpis/DashboardKpis';
import { SignupsChart } from '../../components/SignupsChart/SignupsChart';
import { SignupsMix } from '../../components/SignupsMix/SignupsMix';
import { DEFAULT_DASHBOARD_PERIOD, toPeriodParams } from '../../dashboard.period';
import { useDashboardSummary } from '../../dashboard.queries';
import type {
  DashboardPeriodParams,
  DashboardSummary,
  SellerCredentialing,
} from '../../dashboard.types';
import styles from './DashboardPage.module.css';

const NO_DATA_FOR_FILTERS = 'Não foram encontrados dados para os filtros selecionados';

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

interface SellerRegistrationsProps {
  statusFilter: SellerVerificationStatus | 'ALL';
  onStatusFilterChange: (status: SellerVerificationStatus | 'ALL') => void;
  pendingCount: number;
  onValidate: (item: SellerVerificationListItem) => void;
}

function SellerRegistrations({ statusFilter, onValidate, ...props }: SellerRegistrationsProps) {
  const query = useSellerVerificationsList({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page: 1,
    pageSize: 20,
  });

  if (query.isPending) return <LoadingState message="Carregando vendedores…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return (
    <SellerRegistrationsTable
      items={query.data.data}
      meta={query.data.meta}
      statusFilter={statusFilter}
      onValidate={onValidate}
      onRefresh={() => void query.refetch()}
      {...props}
    />
  );
}

interface DashboardSections {
  credentialing?: SellerCredentialing;
  sellerVerifications: SellerRegistrationsProps;
}

interface DashboardDataProps extends DashboardSections {
  summary: DashboardSummary;
}

function DashboardData({ summary, credentialing, sellerVerifications }: DashboardDataProps) {
  if (summary.isEmpty) return <EmptyState title="Não existem dados para apresentação" />;

  return (
    <>
      <DashboardKpis
        kpis={summary.kpis}
        signups={summary.signupsByMonth}
        credentialing={credentialing}
      />
      {summary.kpis.newUsers === 0 ? (
        <EmptyState title={NO_DATA_FOR_FILTERS} />
      ) : (
        <div className={styles.insights}>
          <SignupsChart signups={summary.signupsByMonth} />
          <SignupsMix kpis={summary.kpis} />
        </div>
      )}
      <SellerRegistrations {...sellerVerifications} />
    </>
  );
}

interface DashboardContentProps extends DashboardSections {
  params: DashboardPeriodParams;
}

function DashboardContent({ params, ...sections }: DashboardContentProps) {
  const query = useDashboardSummary(params);

  if (query.isPending) return <LoadingState message="Carregando o dashboard…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return <DashboardData summary={query.data} {...sections} />;
}

function useSellerCredentialing(
  params: DashboardPeriodParams,
  onAnalyzeQueue: () => void,
): SellerCredentialing | undefined {
  const summary = useSellerVerificationsSummary(params).data;
  return summary && { summary, onAnalyzeQueue };
}

export function DashboardPage() {
  const [period, setPeriod] = useState<Period>(DEFAULT_DASHBOARD_PERIOD);
  const [statusFilter, setStatusFilter] = useState<SellerVerificationStatus | 'ALL'>('ALL');
  const drawer = useSellerVerificationDrawer();
  const params = toPeriodParams(period);

  const credentialing = useSellerCredentialing(params, () => setStatusFilter('PENDING'));
  const pendingCount = credentialing?.summary.pending ?? 0;

  return (
    <section className={styles.page}>
      <DashboardHeader period={period} params={params} onPeriodChange={setPeriod} />
      <DashboardContent
        params={params}
        credentialing={credentialing}
        sellerVerifications={{
          statusFilter,
          onStatusFilterChange: setStatusFilter,
          pendingCount,
          onValidate: (item) => drawer.open(item.id),
        }}
      />
      <SellerVerificationPanel id={drawer.openId} onClose={drawer.close} />
    </section>
  );
}
