import type { PaginatedResponse, PaginationMeta } from '@/types/api';

export const AUDIT_ACTIONS = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_ROLE_UPDATED',
  'USER_SUSPENDED',
  'USER_REACTIVATED',
  'USER_DELETED',
  'GLOBAL_NOTIFICATION_SENT',
  'ALBUM_CREATED',
  'ALBUM_UPDATED',
  'ALBUM_DELETED',
  'CARD_CREATED',
  'CARD_UPDATED',
  'CARD_DELETED',
  'CARDS_IMPORTED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
  'GROUP_SUSPENDED',
  'GROUP_REACTIVATED',
  'GROUP_DELETED',
  'GROUP_MESSAGE_REMOVED',
  'REPORT_DISMISSED',
  'EXPORT_REPORT',
  'CATALOG_REQUEST_APPROVED',
  'CATALOG_REQUEST_REJECTED',
  'SETTING_UPDATED',
  'DEFAULT_CATEGORIES_UPDATED',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  'USER',
  'GROUP',
  'GROUP_MESSAGE',
  'ALBUM',
  'CARD',
  'CATEGORY',
  'CATALOG_REQUEST',
  'REPORT',
  'GLOBAL_NOTIFICATION',
  'GLOBAL_SETTING',
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface AuditLogAdmin {
  id: string;
  name: string;
}

export interface AuditLogListItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  reason: string | null;
  admin: AuditLogAdmin;
  createdAt: string;
}

export interface AuditLogDetail {
  id: string;
  adminId: string;
  admin: AuditLogAdmin;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogListMeta extends PaginationMeta {
  last30Days: number;
}

export type AuditLogPage = PaginatedResponse<AuditLogListItem, AuditLogListMeta>;

export interface AuditLogFilters {
  adminId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

export interface ListAuditLogsParams extends AuditLogFilters {
  page: number;
  pageSize: number;
}
