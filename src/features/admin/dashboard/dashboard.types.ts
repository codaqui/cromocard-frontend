import type { PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';
import type { PaginationParams } from '@/types/api';

export interface DashboardKpis {
  totalUsers: number;
  totalCards: number | null;
  newUsers: number;
  newSellers: number;
}

export interface MonthlySignups {
  month: string;
  customers: number;
  sellers: number;
}

export interface DashboardSummary {
  period: { from: string; to: string };
  kpis: DashboardKpis;
  signupsByMonth: MonthlySignups[];
  isEmpty: boolean;
}

export interface RecentSeller {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type DashboardPeriodParams = { period: PeriodPreset } | { from: string; to: string };

export type RecentSellersParams = DashboardPeriodParams & PaginationParams;
