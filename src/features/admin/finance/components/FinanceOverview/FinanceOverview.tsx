import { useState } from 'react';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import { useFinanceSummary } from '../../finance.queries';
import type { FinancePeriodParams } from '../../finance.types';
import { FinanceCards } from '../FinanceCards/FinanceCards';
import { LedgerModal } from '../LedgerModal/LedgerModal';

interface FinanceOverviewProps {
  params: FinancePeriodParams;
  isToday: boolean;
}

export function FinanceOverview({ params, isToday }: FinanceOverviewProps) {
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const query = useFinanceSummary(params);

  if (query.isPending) return <LoadingState message="Carregando os valores do marketplace…" />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  return (
    <>
      <FinanceCards
        summary={query.data}
        isToday={isToday}
        onOpenLedger={() => setLedgerOpen(true)}
      />
      <LedgerModal open={ledgerOpen} onClose={() => setLedgerOpen(false)} />
    </>
  );
}
