import { describe, expect, it } from 'vitest';

import {
  formatAccountAge,
  formatGroupCode,
  formatMembers,
  formatPendingAlerts,
  formatPendingCases,
  formatPriorWarnings,
  formatReportedAt,
  formatReportedBy,
} from './community-admin.format';

describe('formatação da administração de comunidade', () => {
  it('formata membros e casos pendentes no singular e no plural', () => {
    expect(formatMembers(1)).toBe('1 membro');
    expect(formatMembers(3840)).toBe('3.840 membros');
    expect(formatPendingCases(1)).toBe('1 Caso Pendente');
    expect(formatPendingCases(3)).toBe('3 Casos Pendentes');
    expect(formatPendingAlerts(1)).toBe('1 Pendente');
    expect(formatPendingAlerts(2)).toBe('2 Pendentes');
  });

  it('monta o código curto do grupo com o fim do UUID', () => {
    expect(formatGroupCode('0199a000-0000-7000-8000-00000a9f9821')).toBe('#GRP-9F9821');
  });

  it('mostra "Hoje" para uma denúncia do dia, no horário de Brasília', () => {
    const now = new Date('2026-11-08T20:00:00Z');

    expect(formatReportedAt('2026-11-08T18:01:44Z', now)).toBe('Hoje às 15:01:44');
    expect(formatReportedAt('2026-11-06T18:01:44Z', now)).toBe('06/11/2026 às 15:01:44');
  });

  it('formata a idade da conta em dias, meses ou anos (CCD099 R14)', () => {
    expect(formatAccountAge(0)).toBe('Conta criada hoje');
    expect(formatAccountAge(1)).toBe('Conta criada há 1 dia');
    expect(formatAccountAge(12)).toBe('Conta criada há 12 dias');
    expect(formatAccountAge(60)).toBe('Conta criada há 2 meses');
    expect(formatAccountAge(365)).toBe('Conta criada há 1 ano');
    expect(formatAccountAge(730)).toBe('Conta criada há 2 anos');
  });

  it('formata as advertências anteriores do autor no singular e no plural (CCD099 R14)', () => {
    expect(formatPriorWarnings(0)).toBe('0 advertências prévias');
    expect(formatPriorWarnings(1)).toBe('1 advertência prévia');
    expect(formatPriorWarnings(2)).toBe('2 advertências prévias');
  });

  it('acrescenta quantos membros mais denunciaram (CCD099 R14)', () => {
    expect(formatReportedBy('Carla', 1)).toBe('Carla');
    expect(formatReportedBy('Carla', 2)).toBe('Carla e outros 1 membro');
    expect(formatReportedBy('Carla', 3)).toBe('Carla e outros 2 membros');
  });
});
