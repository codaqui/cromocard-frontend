import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { financeApi } from './finance.api';
import type { FinancePeriodParams, LedgerParams } from './finance.types';

export const financeKeys = {
  all: ['admin', 'finance'] as const,
  summary: (params: FinancePeriodParams) => [...financeKeys.all, 'summary', params] as const,
  ledger: (params: LedgerParams) => [...financeKeys.all, 'ledger', params] as const,
  stats: (kind: 'sellers' | 'cards' | 'groups', ids: string[]) =>
    [...financeKeys.all, kind, ids] as const,
};

export function useFinanceSummary(params: FinancePeriodParams) {
  return useQuery({
    queryKey: financeKeys.summary(params),
    queryFn: () => financeApi.getSummary(params),
    placeholderData: keepPreviousData,
  });
}

export function useLedger(params: LedgerParams, enabled = true) {
  return useQuery({
    queryKey: financeKeys.ledger(params),
    queryFn: () => financeApi.getLedger(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSellerFinanceStats(ids: string[]) {
  return useQuery({
    queryKey: financeKeys.stats('sellers', ids),
    queryFn: () => financeApi.getSellerStats(ids),
    enabled: ids.length > 0,
  });
}

export function useCardFinanceStats(ids: string[]) {
  return useQuery({
    queryKey: financeKeys.stats('cards', ids),
    queryFn: () => financeApi.getCardStats(ids),
    enabled: ids.length > 0,
  });
}

export function useGroupFinanceStats(ids: string[]) {
  return useQuery({
    queryKey: financeKeys.stats('groups', ids),
    queryFn: () => financeApi.getGroupStats(ids),
    enabled: ids.length > 0,
  });
}
