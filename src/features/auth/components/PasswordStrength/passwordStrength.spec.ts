import { describe, expect, it } from 'vitest';

import { passwordStrength, passwordStrengthLabel } from './passwordStrength';

describe('passwordStrength', () => {
  it.each([
    ['', 0, ''],
    ['abc', 0, ''],
    ['abcdefgh', 1, 'Fraca'],
    ['abcdefg1', 2, 'Média'],
    ['Senha@F1', 3, 'Boa'],
    ['Senha@Forte12', 4, 'Forte & Segura'],
  ])('"%s" tem força %i (%s)', (password, strength, label) => {
    expect(passwordStrength(password)).toBe(strength);
    expect(passwordStrengthLabel(strength)).toBe(label);
  });
});
