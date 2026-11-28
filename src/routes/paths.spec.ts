import { describe, expect, it } from 'vitest';

import { cardProfilePathFor, listingDetailPathFor } from './paths';

describe('paths', () => {
  it('R2: monta o endereço do perfil da carta', () => {
    expect(cardProfilePathFor('c1')).toBe('/cartas/c1');
  });

  it('CA3: monta o endereço do detalhe do anúncio', () => {
    expect(listingDetailPathFor('l1')).toBe('/anuncios/l1');
  });
});
