import { describe, expect, it } from 'vitest';

import { isValidPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('tira a máscara', () => {
    expect(normalizePhone('(11) 91234-5678')).toBe('11912345678');
  });
});

describe('isValidPhone', () => {
  it('aceita celular (9 dígitos) e fixo (8 dígitos) com DDD válido', () => {
    expect(isValidPhone('11912345678')).toBe(true);
    expect(isValidPhone('1134567890')).toBe(true);
  });

  it('recusa DDD começando em 0', () => {
    expect(isValidPhone('01912345678')).toBe(false);
    expect(isValidPhone('00912345678')).toBe(false);
  });

  it('recusa número com a quantidade errada de dígitos', () => {
    expect(isValidPhone('119123456')).toBe(false);
  });
});
