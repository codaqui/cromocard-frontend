import { describe, expect, it } from 'vitest';

import { initialsOf } from './listings.format';

describe('initialsOf', () => {
  it('usa as duas primeiras letras do nome de usuário', () => {
    expect(initialsOf('tiago_trocas')).toBe('TI');
  });

  it('usa ? quando não há nome de usuário', () => {
    expect(initialsOf(null)).toBe('?');
  });
});
