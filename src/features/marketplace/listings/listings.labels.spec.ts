import { describe, expect, it } from 'vitest';

import { cardOptionLabel, catalogHelpOf } from './listings.labels';
import { charizard } from './test/listingsFixtures';

const looseCard = { ...charizard, number: null, album: null, category: null };

describe('listings.labels', () => {
  it('R12: monta o nome da carta e a ajuda com a categoria e o álbum', () => {
    expect(cardOptionLabel(charizard)).toBe(
      'Charizard VMAX Shiny Secret - Shining Fates (SV107/SV122)',
    );
    expect(catalogHelpOf(charizard)).toBe(
      'Identificada no catálogo oficial Pokémon TCG • Shining Fates',
    );
  });

  it('R12: carta avulsa, sem álbum nem número, mostra só o que tem', () => {
    expect(cardOptionLabel(looseCard)).toBe('Charizard VMAX Shiny Secret');
    expect(catalogHelpOf(looseCard)).toBe('Identificada no catálogo oficial');
    expect(catalogHelpOf({ ...looseCard, category: charizard.category })).toBe(
      'Identificada no catálogo oficial Pokémon TCG',
    );
  });
});
