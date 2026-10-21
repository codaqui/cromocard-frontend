import type { PaginationParams } from '@/types/api';

import type { Period } from '../dashboard/dashboard.types';

export interface AuditLogView {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: unknown;
  createdAt: string;
  admin: { id: string; name: string; email: string };
}

export interface ListAuditLogsParams extends PaginationParams {
  adminId?: string;
  action?: string;
  entityId?: string;
  period?: Period;
  from?: string;
  to?: string;
}
