import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { dashboardApi } from './dashboard.api';
import type { DashboardPeriodParams, RecentSellersParams } from './dashboard.types';

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  summary: (params: DashboardPeriodParams) => [...dashboardKeys.all, 'summary', params] as const,
  recentSellers: (params: RecentSellersParams) =>
    [...dashboardKeys.all, 'recent-sellers', params] as const,
};

export function useDashboardSummary(params: DashboardPeriodParams) {
  return useQuery({
    queryKey: dashboardKeys.summary(params),
    queryFn: () => dashboardApi.getSummary(params),
    placeholderData: keepPreviousData,
  });
}

export function useRecentSellers(params: RecentSellersParams) {
  return useQuery({
    queryKey: dashboardKeys.recentSellers(params),
    queryFn: () => dashboardApi.listRecentSellers(params),
    placeholderData: keepPreviousData,
  });
}
