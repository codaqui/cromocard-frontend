import { z } from '@/lib/zod';

import { type AuditPeriodPreset, DEFAULT_AUDIT_PERIOD, presetRange } from './audit-logs.period';
import type { AuditAction, AuditLogFilters, ListAuditLogsParams } from './audit-logs.types';

export const AUDIT_LOGS_PAGE_SIZE = 10;
export const INVALID_UUID_MESSAGE = 'Informe o ID completo (UUID)';
export const INVERTED_RANGE_MESSAGE = 'A data final precisa ser igual ou depois da inicial';

export type UuidFilterField = 'adminId' | 'entityId';

export interface AuditLogFiltersState {
  filters: AuditLogFilters;
  drafts: Record<UuidFilterField, string>;
  preset: AuditPeriodPreset;
  page: number;
}

const uuidSchema = z.uuid();
const emptyDrafts: Record<UuidFilterField, string> = { adminId: '', entityId: '' };

const isUuid = (value: string) => uuidSchema.safeParse(value).success;

export function initialFiltersState(now: Date): AuditLogFiltersState {
  return {
    filters: presetRange(DEFAULT_AUDIT_PERIOD, now),
    drafts: emptyDrafts,
    preset: DEFAULT_AUDIT_PERIOD,
    page: 1,
  };
}

export function clearedFiltersState(): AuditLogFiltersState {
  return { filters: {}, drafts: emptyDrafts, preset: 'ALL', page: 1 };
}

export function withFilters(
  state: AuditLogFiltersState,
  patch: AuditLogFilters,
): AuditLogFiltersState {
  return { ...state, filters: { ...state.filters, ...patch }, page: 1 };
}

export function withUuidDraft(
  state: AuditLogFiltersState,
  field: UuidFilterField,
  text: string,
): AuditLogFiltersState {
  const next = { ...state, drafts: { ...state.drafts, [field]: text } };
  const value = text.trim();
  if (value && !isUuid(value)) return next;

  const patch: AuditLogFilters = {};
  patch[field] = value || undefined;
  return withFilters(next, patch);
}

export function withPreset(
  state: AuditLogFiltersState,
  preset: AuditPeriodPreset,
  now: Date,
): AuditLogFiltersState {
  const range = preset === 'CUSTOM' ? state.filters : presetRange(preset, now);
  return { ...withFilters(state, { from: range.from, to: range.to }), preset };
}

export function withToggledAction(
  state: AuditLogFiltersState,
  action: AuditAction,
): AuditLogFiltersState {
  return withFilters(state, { action: state.filters.action === action ? undefined : action });
}

export function toListParams(state: AuditLogFiltersState): ListAuditLogsParams {
  return { ...state.filters, page: state.page, pageSize: AUDIT_LOGS_PAGE_SIZE };
}

export function uuidDraftError(draft: string): string | undefined {
  const value = draft.trim();
  return value && !isUuid(value) ? INVALID_UUID_MESSAGE : undefined;
}

export function rangeError({ from, to }: AuditLogFilters): string | undefined {
  return from && to && from > to ? INVERTED_RANGE_MESSAGE : undefined;
}
