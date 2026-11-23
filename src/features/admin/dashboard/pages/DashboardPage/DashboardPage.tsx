import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import type { Period } from '@/components/PeriodFilter/PeriodFilter';
import {
  FinanceOverview,
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
import { SignupsEvolutionChart } from '../../components/SignupsEvolutionChart/SignupsEvolutionChart';
import { DEFAULT_DASHBOARD_PERIOD, toPeriodParams } from '../../dashboard.period';
import { useDashboardSummary, useSignupsEvolution } from '../../dashboard.queries';
import type {
  DashboardPeriodParams,
  DashboardSummary,
  SellerCredentialing,
} from '../../dashboard.types';
import styles from './DashboardPage.module.css';

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
  selection: PeriodSelection;
}

function DashboardData({
  summary,
  selection,
  credentialing,
  sellerVerifications,
}: DashboardDataProps) {
  if (summary.isEmpty) return <EmptyState title="Não existem dados para apresentação" />;

  return (
    <>
      <DashboardKpis summary={summary} {...selection} credentialing={credentialing} />
      <div className={styles.insights}>
        <SignupsEvolution {...selection} />
        <FinanceOverview
          params={selection.params}
          isToday={'preset' in selection.period && selection.period.preset === 'today'}
        />
      </div>
      <SellerRegistrations {...sellerVerifications} />
    </>
  );
}

interface DashboardContentProps extends DashboardSections {
  selection: PeriodSelection;
}

function DashboardContent({ selection, ...sections }: DashboardContentProps) {
  const query = useDashboardSummary(selection.params);

  if (query.isPending) return <LoadingState message="Carregando o dashboard…" />;
  if (query.isError) {
    return <LoadError message={query.error.message} onRetry={() => void query.refetch()} />;
  }

  return <DashboardData summary={query.data} selection={selection} {...sections} />;
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
        selection={{ params, period }}
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
