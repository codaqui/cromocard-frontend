import type { PaginationMeta } from '@/types/api';

import type { DashboardPeriodParams } from '../dashboard/dashboard.types';

export type FinancePeriodParams = DashboardPeriodParams;

export interface FinanceSummary {
  period: { from: string; to: string };
  custodyCents: number;
  settledCents: number;
  settledOrders: number;
  retainedCents: number;
  hasMovement: boolean;
}

export type MovementType = 'PAYMENT' | 'RELEASE';

export interface LedgerEntry {
  at: string;
  type: MovementType;
  orderId: string;
  buyer: string;
  seller: string;
  amountCents: number;
}

export interface LedgerTotals {
  receivedCents: number;
  releasedCents: number;
  retainedCents: number;
}

export interface LedgerMeta extends PaginationMeta {
  totals: LedgerTotals;
  day: { from: string; to: string };
}

export interface LedgerParams {
  date?: string;
  page?: number;
  pageSize?: number;
}

export interface SellerFinanceStats {
  id: string;
  listedVolumeCents: number;
  activeListings: number;
}

export interface CardFinanceStats {
  id: string;
  averagePriceCents: number | null;
  prices: number;
  population: number;
}

export interface GroupFinanceStats {
  id: string;
  negotiatedVolumeCents: number;
  activeNegotiations: number;
}
