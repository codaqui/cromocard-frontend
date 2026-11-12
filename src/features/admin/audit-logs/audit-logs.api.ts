import { api } from '@/lib/http';

import type {
  AuditLogDetail,
  AuditLogListItem,
  AuditLogListMeta,
  ListAuditLogsParams,
} from './audit-logs.types';

export const auditLogsApi = {
  list: (params: ListAuditLogsParams) =>
    api.getPage<AuditLogListItem, AuditLogListMeta>('/admin/audit-logs', params),
  getById: (id: string) => api.get<AuditLogDetail>(`/admin/audit-logs/${id}`),
};
