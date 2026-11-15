import { useState } from 'react';

import {
  clearedFiltersState,
  initialFiltersState,
  toListParams,
  type UuidFilterField,
  withFilters,
  withPreset,
  withToggledAction,
  withUuidDraft,
} from '../audit-logs.filters';
import type { AuditPeriodPreset } from '../audit-logs.period';
import type { AuditAction, AuditLogFilters } from '../audit-logs.types';

export function useAuditLogFilters() {
  const [state, setState] = useState(() => initialFiltersState(new Date()));

  return {
    state,
    params: toListParams(state),
    setPage: (page: number) => setState((current) => ({ ...current, page })),
    changeFilters: (patch: AuditLogFilters) => setState((current) => withFilters(current, patch)),
    typeUuid: (field: UuidFilterField, text: string) =>
      setState((current) => withUuidDraft(current, field, text)),
    choosePreset: (preset: AuditPeriodPreset) =>
      setState((current) => withPreset(current, preset, new Date())),
    toggleAction: (action: AuditAction) =>
      setState((current) => withToggledAction(current, action)),
    filterByAdmin: (adminId: string) =>
      setState((current) => withUuidDraft(current, 'adminId', adminId)),
    clear: () => setState(clearedFiltersState()),
  };
}

export type AuditLogFiltersController = ReturnType<typeof useAuditLogFilters>;
