import type { PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';
import type { PaginationParams } from '@/types/api';

export interface DashboardKpis {
  totalUsers: number;
  totalCards: number | null;
  newUsers: number;
  newSellers: number;
  collectors: number;
  sellers: number;
  newCardsThisWeek: number;
  usersVariation: number | null;
}

export interface SignupGoal {
  monthly: number;
  percent: number | null;
}

export interface MonthlySignups {
  month: string;
  customers: number;
  sellers: number;
}

export interface DashboardSummary {
  period: { from: string; to: string };
  kpis: DashboardKpis;
  goal: SignupGoal | null;
  signupsByMonth: MonthlySignups[];
  isEmpty: boolean;
}

export type EvolutionBucket = 'hour' | 'day' | 'month';

export interface EvolutionPoint {
  at: string;
  collectors: number;
  sellers: number;
}

export interface EvolutionTotals {
  collectors: number;
  sellers: number;
}

export interface SignupsEvolution {
  period: { from: string; to: string };
  bucket: EvolutionBucket;
  points: EvolutionPoint[];
  totals: EvolutionTotals;
}

export interface RecentSeller {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type DashboardPeriodParams = { period: PeriodPreset } | { from: string; to: string };

export type RecentSellersParams = DashboardPeriodParams & PaginationParams;
