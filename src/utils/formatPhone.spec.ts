import { describe, expect, it } from 'vitest';

import { formatPhone } from './formatPhone';

describe('formatPhone', () => {
  it('mascara o celular (9 dígitos) com +55 e DDD', () => {
    expect(formatPhone('11912345678')).toBe('+55 (11) 91234-5678');
  });

  it('mascara o fixo (8 dígitos) com +55 e DDD', () => {
    expect(formatPhone('1134567890')).toBe('+55 (11) 3456-7890');
  });
});
