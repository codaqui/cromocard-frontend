import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { categoryOption, defaultCategory } from '../test/fixtures';
import { useDefaultCategoriesDraft } from './useDefaultCategoriesEditor';

const pokemon = defaultCategory('c-pokemon', 'Pokémon');
const magic = defaultCategory('c-magic', 'Magic: The Gathering');
const futebol = defaultCategory('c-futebol', 'Futebol');

function setup(initial = [pokemon, magic, futebol]) {
  const { result } = renderHook(() => useDefaultCategoriesDraft(initial));
  const ids = () => result.current.draft.map(({ id }) => id);
  return { result, ids };
}

describe('useDefaultCategoriesDraft', () => {
  it('R3: moveUp e moveDown trocam a categoria com a vizinha', () => {
    const { result, ids } = setup();

    act(() => result.current.moveDown(0));
    expect(ids()).toEqual(['c-magic', 'c-pokemon', 'c-futebol']);

    act(() => result.current.moveUp(2));
    expect(ids()).toEqual(['c-magic', 'c-futebol', 'c-pokemon']);
  });

  it('R3: moveTo leva a categoria da origem ao destino', () => {
    const { result, ids } = setup();

    act(() => result.current.moveTo(2, 0));

    expect(ids()).toEqual(['c-futebol', 'c-pokemon', 'c-magic']);
  });

  it('R8: mover para fora das pontas não muda nada', () => {
    const { result, ids } = setup();

    act(() => result.current.moveUp(0));
    act(() => result.current.moveDown(2));

    expect(ids()).toEqual(['c-pokemon', 'c-magic', 'c-futebol']);
  });

  it('R4: togglePin fixa no topo e desafixa sem mover', () => {
    const { result, ids } = setup();

    act(() => result.current.togglePin('c-futebol'));
    expect(ids()).toEqual(['c-futebol', 'c-pokemon', 'c-magic']);
    expect(result.current.draft[0]?.isPinned).toBe(true);

    act(() => result.current.togglePin('c-futebol'));
    expect(ids()).toEqual(['c-futebol', 'c-pokemon', 'c-magic']);
    expect(result.current.draft.some(({ isPinned }) => isPinned)).toBe(false);
  });

  it('R7: reset volta a lista carregada, com a ordem e o fixado de antes', () => {
    const { result, ids } = setup();

    act(() => result.current.moveTo(0, 2));
    act(() => result.current.togglePin('c-magic'));
    act(() => result.current.reset());

    expect(ids()).toEqual(['c-pokemon', 'c-magic', 'c-futebol']);
    expect(result.current.draft.some(({ isPinned }) => isPinned)).toBe(false);
  });

  it('R2: add põe a categoria no fim, sem verso e sem fixar, com o slug e a quantidade dela', () => {
    const { result } = setup([pokemon]);

    act(() => result.current.add({ ...categoryOption('c-onepiece', 'One Piece'), cardsCount: 12 }));

    expect(result.current.draft[1]).toEqual(
      expect.objectContaining({
        id: 'c-onepiece',
        slug: 'one-piece',
        cardsCount: 12,
        displayOrder: 1,
        isPinned: false,
        backImageUrl: null,
      }),
    );
  });

  it('remove tira a categoria e setBack guarda o verso novo', () => {
    const { result, ids } = setup();

    act(() => result.current.remove('c-magic'));
    act(() => result.current.setBack('c-pokemon', 'https://cdn/verso.png'));

    expect(ids()).toEqual(['c-pokemon', 'c-futebol']);
    expect(result.current.draft[0]?.backImageUrl).toBe('https://cdn/verso.png');
  });
});
