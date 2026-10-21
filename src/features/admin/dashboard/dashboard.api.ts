import { api } from '@/lib/http';

import type { DashboardSummary, Period } from './dashboard.types';

export const dashboardApi = {
  getSummary: (period: Period) => api.get<DashboardSummary>('/admin/dashboard', { period }),
};
