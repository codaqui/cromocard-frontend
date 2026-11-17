import { describe, expect, it } from 'vitest';

import {
  clearedFiltersState,
  INVALID_UUID_MESSAGE,
  INVERTED_RANGE_MESSAGE,
  initialFiltersState,
  rangeError,
  toListParams,
  uuidDraftError,
  withFilters,
  withPreset,
  withToggledAction,
  withUuidDraft,
} from './audit-logs.filters';
import { presetRange } from './audit-logs.period';

const NOW = new Date('2026-11-09T02:30:00Z');
const ADMIN_ID = '0193a0c4-7b2e-7c11-9a55-1f2e3d4c5b6a';

describe('audit-logs.filters', () => {
  it('começa nos últimos 7 dias pelo horário de Brasília, na página 1', () => {
    expect(toListParams(initialFiltersState(NOW))).toEqual({
      from: '2026-11-02',
      to: '2026-11-08',
      page: 1,
      pageSize: 10,
    });
  });

  it('volta para a página 1 ao mudar um filtro', () => {
    const state = { ...initialFiltersState(NOW), page: 4 };

    expect(withFilters(state, { entityType: 'GROUP' }).page).toBe(1);
  });

  it('guarda o ID incompleto sem aplicar e aplica quando ele fica completo', () => {
    const typing = withUuidDraft(initialFiltersState(NOW), 'adminId', '0193a0c4');

    expect(typing.drafts.adminId).toBe('0193a0c4');
    expect(typing.filters.adminId).toBeUndefined();
    expect(withUuidDraft(typing, 'adminId', ADMIN_ID).filters.adminId).toBe(ADMIN_ID);
  });

  it('tira o filtro de ID quando o campo fica vazio', () => {
    const filtered = withUuidDraft(initialFiltersState(NOW), 'entityId', ADMIN_ID);

    expect(withUuidDraft(filtered, 'entityId', '').filters.entityId).toBeUndefined();
  });

  it('liga e desliga o filtro rápido de uma ação', () => {
    const on = withToggledAction(initialFiltersState(NOW), 'USER_ROLE_UPDATED');

    expect(on.filters.action).toBe('USER_ROLE_UPDATED');
    expect(withToggledAction(on, 'USER_ROLE_UPDATED').filters.action).toBeUndefined();
  });

  it('mantém as datas ao escolher o intervalo personalizado e as remove em todo o período', () => {
    const custom = withPreset(initialFiltersState(NOW), 'CUSTOM', NOW);

    expect(custom.filters).toMatchObject({ from: '2026-11-02', to: '2026-11-08' });
    expect(withPreset(custom, 'ALL', NOW).filters).toMatchObject({
      from: undefined,
      to: undefined,
    });
  });

  it('limpa todos os filtros, inclusive o período', () => {
    const cleared = clearedFiltersState();

    expect(cleared.preset).toBe('ALL');
    expect(cleared.drafts).toEqual({ adminId: '', entityId: '' });
    expect(toListParams(cleared)).toEqual({ page: 1, pageSize: 10 });
  });

  it('valida o ID e o intervalo de datas', () => {
    expect(uuidDraftError('abc')).toBe(INVALID_UUID_MESSAGE);
    expect(uuidDraftError(ADMIN_ID)).toBeUndefined();
    expect(rangeError({ from: '2026-11-08', to: '2026-11-01' })).toBe(INVERTED_RANGE_MESSAGE);
    expect(rangeError({ from: '2026-11-01', to: '2026-11-08' })).toBeUndefined();
  });

  it('calcula hoje e os últimos 30 dias pelo dia de Brasília', () => {
    expect(presetRange('TODAY', NOW)).toEqual({ from: '2026-11-08', to: '2026-11-08' });
    expect(presetRange('LAST_30_DAYS', NOW)).toEqual({ from: '2026-10-10', to: '2026-11-08' });
  });
});
