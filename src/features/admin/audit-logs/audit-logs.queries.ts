import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { auditLogsApi } from './audit-logs.api';
import type { ListAuditLogsParams } from './audit-logs.types';

export const auditLogsKeys = {
  all: ['admin', 'audit-logs'] as const,
  list: (params: ListAuditLogsParams) => [...auditLogsKeys.all, 'list', params] as const,
  detail: (id: string) => [...auditLogsKeys.all, 'detail', id] as const,
};

export function useAuditLogs(params: ListAuditLogsParams) {
  return useQuery({
    queryKey: auditLogsKeys.list(params),
    queryFn: () => auditLogsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useAuditLogDetail(id: string | null) {
  return useQuery({
    queryKey: auditLogsKeys.detail(id ?? ''),
    queryFn: () => auditLogsApi.getById(id ?? ''),
    enabled: id !== null,
  });
}
