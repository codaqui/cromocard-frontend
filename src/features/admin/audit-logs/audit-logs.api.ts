import { api } from '@/lib/http';

import type { AuditLogView, ListAuditLogsParams } from './audit-logs.types';

export const auditLogsApi = {
  list: (params: ListAuditLogsParams) => api.getPage<AuditLogView>('/admin/audit-logs', params),
  getById: (id: string) => api.get<AuditLogView>(`/admin/audit-logs/${id}`),
};
