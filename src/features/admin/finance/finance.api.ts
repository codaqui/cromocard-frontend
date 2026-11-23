import { api } from '@/lib/http';

import type {
  CardFinanceStats,
  FinancePeriodParams,
  FinanceSummary,
  GroupFinanceStats,
  LedgerEntry,
  LedgerMeta,
  LedgerParams,
  SellerFinanceStats,
} from './finance.types';

export const LEDGER_PAGE_SIZE = 10;

const FINANCE_PATH = '/admin/finance';
const byIds = (ids: string[]) => ({ ids: ids.join(',') });

export const financeApi = {
  getSummary: (params: FinancePeriodParams) =>
    api.get<FinanceSummary>(`${FINANCE_PATH}/summary`, params),

  getLedger: (params: LedgerParams) =>
    api.getPage<LedgerEntry, LedgerMeta>(`${FINANCE_PATH}/ledger`, {
      pageSize: LEDGER_PAGE_SIZE,
      ...params,
    }),

  getSellerStats: (ids: string[]) =>
    api.get<SellerFinanceStats[]>(`${FINANCE_PATH}/sellers`, byIds(ids)),

  getCardStats: (ids: string[]) =>
    api.get<CardFinanceStats[]>(`${FINANCE_PATH}/cards`, byIds(ids)),

  getGroupStats: (ids: string[]) =>
    api.get<GroupFinanceStats[]>(`${FINANCE_PATH}/groups`, byIds(ids)),
};
