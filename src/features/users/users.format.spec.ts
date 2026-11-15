import { describe, expect, it } from 'vitest';

import { initialsOf, shortIdOf } from './users.format';

describe('users.format', () => {
  it('initialsOf usa as duas primeiras palavras, ignora espaços extras e aceita nome de uma palavra', () => {
    expect(initialsOf('  ana   colecionadora silva ')).toBe('AC');
    expect(initialsOf('Bruno')).toBe('B');
    expect(initialsOf('')).toBe('');
  });

  it('shortIdOf pega os 6 últimos caracteres em maiúsculas', () => {
    expect(shortIdOf('0190a000-0000-7001-89cb-42e6c5c300ea')).toBe('#USR-C300EA');
  });
});
