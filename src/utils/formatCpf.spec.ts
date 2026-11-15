import { describe, expect, it } from 'vitest';

import { formatCpf, maskCpf } from './formatCpf';

describe('formatCpf', () => {
  it('mascara os 11 dígitos como 000.000.000-00', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });
});

describe('maskCpf', () => {
  it('esconde os dígitos do meio e deixa os 3 primeiros e os verificadores', () => {
    expect(maskCpf('22948155645')).toBe('229.***.***-45');
  });
});
