import { describe, expect, it } from 'vitest';

import { reasonOf, shortId } from './audit-logs.format';
import { auditActionMeta, auditEntityTypeLabel, toAuditAction } from './audit-logs.labels';
import { DEFAULT_AUDIT_PERIOD, toAuditPeriodPreset } from './audit-logs.period';

describe('audit-logs.format', () => {
  it('lê o motivo só quando ele é texto', () => {
    expect(reasonOf({ reason: 'Spam' })).toBe('Spam');
    expect(reasonOf({ reason: 42 })).toBeNull();
    expect(reasonOf(null)).toBeNull();
  });

  it('encurta o id com reticências', () => {
    expect(shortId('0193a0c4-7b2e-7c11-9a55-1f2e3d4c5b6a')).toMatch(/^0193a0c4.*…$/);
  });
});

describe('audit-logs.labels', () => {
  it('usa o rótulo da ação conhecida', () => {
    expect(auditActionMeta('GROUP_DELETED').label).toBe('Excluiu Grupo');
  });

  it('mostra a ação desconhecida sem os sublinhados e com tom neutro', () => {
    expect(auditActionMeta('NEW_ACTION')).toEqual({ label: 'NEW ACTION', tone: 'neutral' });
  });

  it('mostra o tipo de entidade desconhecido como veio', () => {
    expect(auditEntityTypeLabel('GROUP')).toBe('Grupo');
    expect(auditEntityTypeLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('só aceita ações conhecidas no filtro', () => {
    expect(toAuditAction('USER_SUSPENDED')).toBe('USER_SUSPENDED');
    expect(toAuditAction('')).toBeUndefined();
  });
});

describe('audit-logs.period', () => {
  it('volta ao período padrão quando o valor não é conhecido', () => {
    expect(toAuditPeriodPreset('CUSTOM')).toBe('CUSTOM');
    expect(toAuditPeriodPreset('YESTERDAY')).toBe(DEFAULT_AUDIT_PERIOD);
  });
});
