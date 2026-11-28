import type { CardCondition, CardOption } from '../listings.types';

export const charizard: CardOption = {
  id: '0190a000-0000-7000-8000-000000000001',
  name: 'Charizard VMAX Shiny Secret',
  number: 'SV107/SV122',
  frontImageUrl: null,
  album: { id: '0190a000-0000-7000-8000-000000000002', title: 'Shining Fates' },
  category: { id: '0190a000-0000-7000-8000-000000000003', name: 'Pokémon TCG' },
};

export const conditions: CardCondition[] = ['Mint', 'Near Mint', 'Ótimo', 'Bom', 'Regular'].map(
  (name, index) => ({ id: `condition-${index + 1}`, name, sortOrder: index + 1 }),
);

export const cardPage = (cards: CardOption[]) => ({
  data: cards,
  meta: { page: 1, pageSize: 10, total: cards.length, totalPages: 1 },
});
