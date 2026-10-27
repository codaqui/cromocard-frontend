import { describe, expect, it } from 'vitest';

import { REASON_MAX_LENGTH, REASON_MIN_LENGTH, reasonSchema } from './reason';

describe('reasonSchema', () => {
  it('aceita o motivo e tira os espaços das pontas', () => {
    expect(reasonSchema.parse('  Spam repetido  ')).toBe('Spam repetido');
  });

  it('recusa motivo com menos de 3 caracteres depois do trim', () => {
    const result = reasonSchema.safeParse('  ok  ');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      `O motivo precisa ter pelo menos ${REASON_MIN_LENGTH} caracteres`,
    );
  });

  it('aceita exatamente 500 caracteres e recusa 501', () => {
    expect(reasonSchema.safeParse('a'.repeat(REASON_MAX_LENGTH)).success).toBe(true);

    const result = reasonSchema.safeParse('a'.repeat(REASON_MAX_LENGTH + 1));
    expect(result.error?.issues[0]?.message).toBe(
      `O motivo pode ter no máximo ${REASON_MAX_LENGTH} caracteres`,
    );
  });
});
