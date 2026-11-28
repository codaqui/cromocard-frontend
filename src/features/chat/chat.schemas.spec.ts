import { describe, expect, it } from 'vitest';

import { MESSAGE_MAX_LENGTH, messageContentSchema } from './chat.schemas';

describe('messageContentSchema (CA16)', () => {
  it('tira os espaços das pontas', () => {
    expect(messageContentSchema.parse('  Oi, tudo bem?  ')).toBe('Oi, tudo bem?');
  });

  it('recusa mensagem vazia ou só com espaços', () => {
    expect(messageContentSchema.safeParse('   ').success).toBe(false);
  });

  it('aceita até o limite do backend e recusa acima dele', () => {
    expect(messageContentSchema.safeParse('a'.repeat(MESSAGE_MAX_LENGTH)).success).toBe(true);
    expect(messageContentSchema.safeParse('a'.repeat(MESSAGE_MAX_LENGTH + 1)).success).toBe(false);
  });
});
