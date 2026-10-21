import type { UserRole } from '@/types/authenticated-user';

export type Period = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_YEAR';

export interface DashboardSummary {
  period: Period;
  users: {
    total: number;
    byRole: Record<UserRole, number>;
    newInPeriod: number;
  };
  catalog: {
    totalCards: number;
    totalAlbums: number;
  };
  pendingCatalogRequests: number;
}
