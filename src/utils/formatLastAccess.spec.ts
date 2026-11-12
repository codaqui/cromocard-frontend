import { describe, expect, it } from 'vitest';

import { formatLastAccess } from './formatLastAccess';

const now = new Date('2026-11-12T18:00:00');

describe('formatLastAccess', () => {
  it('mostra "Hoje, HH:mm" para acesso no mesmo dia', () => {
    expect(formatLastAccess('2026-11-12T14:28:00', now)).toBe('Hoje, 14:28');
  });

  it('mostra "Ontem, HH:mm" para acesso no dia anterior', () => {
    expect(formatLastAccess('2026-11-11T23:10:00', now)).toBe('Ontem, 23:10');
  });

  it('mostra a data curta para acesso há mais de um dia', () => {
    expect(formatLastAccess('2026-11-01T08:00:00', now)).toBe('01/11/2026');
  });
});
