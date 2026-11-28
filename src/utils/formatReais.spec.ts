import { describe, expect, it } from 'vitest';

import { formatReais } from './formatReais';

const NBSP = ' ';

describe('formatReais', () => {
  it('mostra o valor inteiro sem centavos, como no Figma', () => {
    expect(formatReais('1750.00')).toBe(`R$${NBSP}1.750`);
  });

  it('mostra os centavos quando existem', () => {
    expect(formatReais('899.90')).toBe(`R$${NBSP}899,90`);
  });

  it('mantém o espaço inquebrável, para o "R$" não ficar sozinho numa linha', () => {
    expect(formatReais('10.00')).not.toContain(' ');
  });

  it('mostra o traço quando não há valor', () => {
    expect(formatReais(null)).toBe('—');
  });
});
