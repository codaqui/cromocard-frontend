import { describe, expect, it } from 'vitest';

import { feeBreakdownOf, isValidApiPrice, toApiPrice } from './listings.fee';

const normalize = (text: string | undefined) => text?.replace(/\s/g, ' ');

describe('listings.fee', () => {
  it('CA1: R$ 1.850,00 dá taxa de R$ 92,50 e líquido de R$ 1.757,50', () => {
    const fee = feeBreakdownOf('1.850,00');

    expect(normalize(fee?.platformFee)).toBe('R$ 92,50');
    expect(normalize(fee?.netAmount)).toBe('R$ 1.757,50');
  });

  it('R6: arredonda a taxa para baixo, a favor do vendedor', () => {
    const fee = feeBreakdownOf('0,99');

    expect(normalize(fee?.platformFee)).toBe('R$ 0,04');
    expect(normalize(fee?.netAmount)).toBe('R$ 0,95');
  });

  it('R6: calcula preço sem centavos e com um dígito de centavo', () => {
    expect(normalize(feeBreakdownOf('40')?.netAmount)).toBe('R$ 38,00');
    expect(normalize(feeBreakdownOf('12,5')?.platformFee)).toBe('R$ 0,62');
  });

  it('R5: não calcula para preço zerado, negativo ou que não é número', () => {
    expect(feeBreakdownOf('0')).toBeNull();
    expect(feeBreakdownOf('-10')).toBeNull();
    expect(feeBreakdownOf('abc')).toBeNull();
    expect(feeBreakdownOf('')).toBeNull();
  });

  it('converte o preço digitado no formato da API', () => {
    expect(toApiPrice('R$ 1.850,00')).toBe('1850.00');
    expect(toApiPrice('12,5')).toBe('12.5');
    expect(toApiPrice('40')).toBe('40');
    expect(isValidApiPrice('123456789.00')).toBe(false);
    expect(isValidApiPrice('10.999')).toBe(false);
  });
});
