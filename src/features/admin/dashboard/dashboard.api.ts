import { api } from '@/lib/http';

import type { DashboardPeriodParams, DashboardSummary, SignupsEvolution } from './dashboard.types';

export const dashboardApi = {
  getSummary: (params: DashboardPeriodParams) =>
    api.get<DashboardSummary>('/admin/dashboard', params),
  getSignupsEvolution: (params: DashboardPeriodParams) =>
    api.get<SignupsEvolution>('/admin/dashboard/signups-evolution', params),
};
