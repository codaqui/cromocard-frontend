import { api } from '@/lib/http';

import type { DashboardPeriodParams, DashboardSummary } from './dashboard.types';

export const dashboardApi = {
  getSummary: (params: DashboardPeriodParams) =>
    api.get<DashboardSummary>('/admin/dashboard', params),
};
