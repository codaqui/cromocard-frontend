import type { SelectOption } from '@/components/Select/Select';

import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  type AuditAction,
  type AuditEntityType,
} from './audit-logs.types';

export type AuditActionTone = 'danger' | 'warning' | 'info' | 'primary' | 'neutral';

export interface AuditActionMeta {
  label: string;
  tone: AuditActionTone;
}

export const AUDIT_ACTION_META: Record<AuditAction, AuditActionMeta> = {
  USER_CREATED: { label: 'Criou Usuário', tone: 'primary' },
  USER_UPDATED: { label: 'Editou Usuário', tone: 'neutral' },
  USER_ROLE_UPDATED: { label: 'Alterou Papel do Usuário', tone: 'info' },
  USER_SUSPENDED: { label: 'Suspendeu Usuário', tone: 'danger' },
  USER_REACTIVATED: { label: 'Reativou Usuário', tone: 'info' },
  USER_DELETED: { label: 'Excluiu Usuário', tone: 'danger' },
  GLOBAL_NOTIFICATION_SENT: { label: 'Enviou Notificação Global', tone: 'neutral' },
  ALBUM_CREATED: { label: 'Criou Álbum', tone: 'primary' },
  ALBUM_UPDATED: { label: 'Editou Álbum', tone: 'neutral' },
  ALBUM_DELETED: { label: 'Excluiu Álbum', tone: 'warning' },
  CARD_CREATED: { label: 'Criou Carta', tone: 'primary' },
  CARD_UPDATED: { label: 'Editou Carta', tone: 'neutral' },
  CARD_DELETED: { label: 'Excluiu Carta', tone: 'warning' },
  CARDS_IMPORTED: { label: 'Importou Cartas', tone: 'primary' },
  CATEGORY_CREATED: { label: 'Criou Categoria', tone: 'primary' },
  CATEGORY_UPDATED: { label: 'Editou Categoria', tone: 'neutral' },
  CATEGORY_DELETED: { label: 'Excluiu Categoria', tone: 'warning' },
  GROUP_SUSPENDED: { label: 'Suspendeu Grupo', tone: 'warning' },
  GROUP_REACTIVATED: { label: 'Reativou Grupo', tone: 'info' },
  GROUP_DELETED: { label: 'Excluiu Grupo', tone: 'warning' },
  GROUP_MESSAGE_REMOVED: { label: 'Removeu Mensagem de Grupo', tone: 'warning' },
  REPORT_DISMISSED: { label: 'Arquivou Denúncia', tone: 'neutral' },
  EXPORT_REPORT: { label: 'Exportou Relatório', tone: 'neutral' },
  CATALOG_REQUEST_APPROVED: { label: 'Aprovou Solicitação de Catálogo', tone: 'primary' },
  CATALOG_REQUEST_REJECTED: { label: 'Recusou Solicitação de Catálogo', tone: 'warning' },
  SETTING_UPDATED: { label: 'Alterou Configuração Global', tone: 'info' },
  DEFAULT_CATEGORIES_UPDATED: { label: 'Alterou Categorias Padrão', tone: 'info' },
};

export const AUDIT_ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  USER: 'Usuário',
  GROUP: 'Grupo',
  GROUP_MESSAGE: 'Mensagem de Grupo',
  ALBUM: 'Álbum',
  CARD: 'Carta do Catálogo',
  CATEGORY: 'Categoria',
  CATALOG_REQUEST: 'Solicitação de Catálogo',
  REPORT: 'Denúncia',
  GLOBAL_NOTIFICATION: 'Notificação Global',
  GLOBAL_SETTING: 'Configuração do Sistema',
};

export const isAuditAction = (value: string): value is AuditAction =>
  (AUDIT_ACTIONS as readonly string[]).includes(value);

const isAuditEntityType = (value: string): value is AuditEntityType =>
  (AUDIT_ENTITY_TYPES as readonly string[]).includes(value);

export function auditActionMeta(action: string): AuditActionMeta {
  if (isAuditAction(action)) return AUDIT_ACTION_META[action];
  return { label: action.replaceAll('_', ' '), tone: 'neutral' };
}

export function auditEntityTypeLabel(entityType: string): string {
  return isAuditEntityType(entityType) ? AUDIT_ENTITY_TYPE_LABELS[entityType] : entityType;
}

export const auditActionOptions: SelectOption[] = AUDIT_ACTIONS.map((action) => ({
  value: action,
  label: AUDIT_ACTION_META[action].label,
}));

export const auditEntityTypeOptions: SelectOption[] = AUDIT_ENTITY_TYPES.map((entityType) => ({
  value: entityType,
  label: AUDIT_ENTITY_TYPE_LABELS[entityType],
}));

export function toAuditAction(value: string): AuditAction | undefined {
  return isAuditAction(value) ? value : undefined;
}
