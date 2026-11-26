import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatLedgerDay,
  formatLedgerTime,
  orderCode,
  splitCurrency,
} from './finance.format';

const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('finance.format', () => {
  it('formata centavos em reais', () => {
    expect(normalize(formatCurrency(489214000))).toBe('R$ 4.892.140,00');
  });

  it('separa os centavos do valor inteiro', () => {
    const { whole, fraction } = splitCurrency(321040000);

    expect(normalize(whole)).toBe('R$ 3.210.400');
    expect(fraction).toBe(',00');
  });

  it('mostra a hora do livro razão no horário de Brasília', () => {
    expect(formatLedgerTime('2026-11-12T01:48:00Z')).toBe('22h48');
  });

  it('mostra o dia do livro razão como no Figma', () => {
    expect(formatLedgerDay('2026-11-11T03:00:00Z')).toBe('11 Nov, 2026');
  });

  it('gera o código do pedido com o final do id', () => {
    expect(orderCode('0193a1b2-c3d4-7e5f-8a9b-0c1d2e348211')).toBe('#PED-48211');
  });
});
