import { describe, expect, it } from 'vitest';

import { suggestedMessage } from './chat.labels';

describe('suggestedMessage (CCD073)', () => {
  it('CA1: sugere a mensagem com a carta e o preço do anúncio', () => {
    expect(suggestedMessage({ id: 'a1', cardName: 'Lionel Messi', price: 1750 })).toBe(
      'Olá! Tenho interesse no anúncio Lionel Messi (R$ 1.750).',
    );
  });
});
