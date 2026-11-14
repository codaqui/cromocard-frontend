import { describe, expect, it } from 'vitest';

import { isValidCpf, normalizeCpf } from './cpf';

describe('normalizeCpf', () => {
  it('tira pontos e hífen', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
  });
});

describe('isValidCpf', () => {
  it('aceita um CPF válido, com ou sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('recusa todos os dígitos iguais', () => {
    expect(isValidCpf('11111111111')).toBe(false);
  });

  it('recusa um CPF com dígito verificador errado', () => {
    expect(isValidCpf('52998224726')).toBe(false);
  });

  it('recusa um CPF com menos de 11 dígitos', () => {
    expect(isValidCpf('5299822472')).toBe(false);
  });

  it('cobre o resto 10 virando 0 no segundo dígito verificador', () => {
    expect(isValidCpf('03417489601')).toBe(true);
  });
});
