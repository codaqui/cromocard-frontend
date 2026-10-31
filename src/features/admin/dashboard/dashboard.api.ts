import { api } from '@/lib/http';

import type {
  DashboardPeriodParams,
  DashboardSummary,
  RecentSeller,
  RecentSellersParams,
} from './dashboard.types';

export const dashboardApi = {
  getSummary: (params: DashboardPeriodParams) =>
    api.get<DashboardSummary>('/admin/dashboard', params),
  listRecentSellers: (params: RecentSellersParams) =>
    api.getPage<RecentSeller>('/admin/dashboard/recent-sellers', params),
};
