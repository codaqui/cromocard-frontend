import { describe, expect, it } from 'vitest';

import { badgesOf, breadcrumbOf, galleryImagesOf, subtitleOf } from './card-profile.format';
import type { CardProfile } from './card-profile.types';

const looseCard: CardProfile = {
  id: 'c1',
  name: 'Pikachu',
  images: { front: null, back: 'https://cdn/verso.png', photos: ['https://cdn/d1.png'] },
  breadcrumb: { category: null },
  identification: { number: null, album: null, category: null, rarity: null, language: null },
  market: { averagePrice: null, lowestListingPrice: null, activeListingsCount: 0 },
};

describe('card-profile.format', () => {
  it('L1: junta frente, verso e fotos, sem as imagens vazias', () => {
    expect(galleryImagesOf(looseCard)).toEqual(['https://cdn/verso.png', 'https://cdn/d1.png']);
  });

  it('R17: carta avulsa, sem álbum nem categoria, fica com o caminho curto e sem selos', () => {
    expect(breadcrumbOf(looseCard)).toEqual(['Início', 'Marketplace', 'Pikachu']);
    expect(badgesOf(looseCard)).toEqual([]);
    expect(subtitleOf(looseCard)).toBe('');
  });
});
