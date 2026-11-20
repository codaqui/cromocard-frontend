import { describe, expect, it } from 'vitest';

import {
  formatDispatchDate,
  formatLongDay,
  formatScheduleDate,
  formatScheduleNotice,
  todayInBrasilia,
  toScheduledAt,
  usersLabel,
} from './global-notifications.format';
import { channelsLabel } from './global-notifications.labels';

describe('global-notifications.format', () => {
  it('formata as datas no horário de Brasília, como no Figma', () => {
    expect(formatDispatchDate('2026-11-13T23:30:00Z')).toBe('13 Nov 2026 • 20:30');
    expect(formatScheduleDate('2026-11-13T23:30:00Z')).toBe('13/11/2026, 20:30');
    expect(formatLongDay('2026-11-13')).toBe('Sexta-feira, 13 de novembro de 2026');
    expect(formatScheduleNotice('2026-11-13', '20:30')).toBe('13/11/2026 às 20:30');
  });

  it('converte o dia e o horário de Brasília para UTC', () => {
    expect(toScheduledAt('2026-11-13', '20:30')).toBe('2026-11-13T23:30:00.000Z');
    expect(todayInBrasilia(new Date('2026-11-17T02:00:00Z'))).toBe('2026-11-16');
  });

  it('escreve a quantidade de usuários no singular e no plural', () => {
    expect(usersLabel(48920)).toBe('48.920 usuários');
    expect(usersLabel(1)).toBe('1 usuário');
  });

  it('junta os canais na ordem do formulário', () => {
    expect(channelsLabel(['EMAIL', 'IN_APP'])).toBe('Plataforma + E-mail');
    expect(channelsLabel(['EMAIL'])).toBe('E-mail');
  });
});
