import { describe, expect, it } from 'vitest';

import { formatCpf } from './formatCpf';

describe('formatCpf', () => {
  it('mascara os 11 dígitos como 000.000.000-00', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });
});
