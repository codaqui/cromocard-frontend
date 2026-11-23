import { describe, expect, it } from 'vitest';

import { formatPrice, initialsOf } from './listings.format';

describe('formatPrice', () => {
  it('mostra o valor inteiro sem centavos, como no Figma', () => {
    expect(formatPrice('1750.00')).toBe('R$ 1.750');
  });

  it('mostra os centavos quando existem', () => {
    expect(formatPrice('899.90')).toBe('R$ 899,90');
  });

  it('mostra o traço quando não há valor', () => {
    expect(formatPrice(null)).toBe('—');
  });
});

describe('initialsOf', () => {
  it('usa as duas primeiras letras do nome de usuário', () => {
    expect(initialsOf('tiago_trocas')).toBe('TI');
  });

  it('usa ? quando não há nome de usuário', () => {
    expect(initialsOf(null)).toBe('?');
  });
});
