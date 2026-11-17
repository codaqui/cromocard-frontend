import { describe, expect, it } from 'vitest';

import { moveCategory, togglePinned } from './settings.order';
import { defaultCategory } from './test/fixtures';

const pokemon = defaultCategory('c-pokemon', 'Pokémon');
const magic = defaultCategory('c-magic', 'Magic: The Gathering');
const futebol = defaultCategory('c-futebol', 'Futebol');
const list = [pokemon, magic, futebol];

const idsOf = (categories: { id: string }[]) => categories.map(({ id }) => id);

describe('moveCategory', () => {
  it('R3: sobe uma categoria e renumera a posição de todas', () => {
    const moved = moveCategory(list, 1, 0);

    expect(idsOf(moved)).toEqual(['c-magic', 'c-pokemon', 'c-futebol']);
    expect(moved.map(({ displayOrder }) => displayOrder)).toEqual([0, 1, 2]);
  });

  it('R3: leva a categoria da origem ao destino, arrastando para longe', () => {
    expect(idsOf(moveCategory(list, 0, 2))).toEqual(['c-magic', 'c-futebol', 'c-pokemon']);
  });

  it('R8: ignora o movimento para fora das pontas e para o mesmo lugar', () => {
    expect(moveCategory(list, 0, -1)).toBe(list);
    expect(moveCategory(list, 2, 3)).toBe(list);
    expect(moveCategory(list, 1, 1)).toBe(list);
    expect(moveCategory(list, 9, 0)).toBe(list);
  });
});

describe('togglePinned', () => {
  it('CA3: fixar leva a categoria para a primeira posição', () => {
    const pinned = togglePinned(list, 'c-futebol');

    expect(idsOf(pinned)).toEqual(['c-futebol', 'c-pokemon', 'c-magic']);
    expect(pinned.map(({ isPinned }) => isPinned)).toEqual([true, false, false]);
  });

  it('CA8: fixar outra tira o fixado da anterior', () => {
    const pinned = togglePinned(togglePinned(list, 'c-pokemon'), 'c-magic');

    expect(idsOf(pinned)).toEqual(['c-magic', 'c-pokemon', 'c-futebol']);
    expect(pinned.filter(({ isPinned }) => isPinned).map(({ id }) => id)).toEqual(['c-magic']);
  });

  it('CA9: desafixar mantém a categoria na posição em que está', () => {
    const unpinned = togglePinned(togglePinned(list, 'c-pokemon'), 'c-pokemon');

    expect(idsOf(unpinned)).toEqual(['c-pokemon', 'c-magic', 'c-futebol']);
    expect(unpinned.every(({ isPinned }) => !isPinned)).toBe(true);
  });

  it('CA9: desafixar uma categoria que foi movida não a leva de volta ao topo', () => {
    const moved = moveCategory(togglePinned(list, 'c-pokemon'), 0, 2);

    expect(idsOf(togglePinned(moved, 'c-pokemon'))).toEqual(['c-magic', 'c-futebol', 'c-pokemon']);
  });

  it('ignora um id que não está na lista', () => {
    expect(togglePinned(list, 'c-nao-existe')).toBe(list);
  });
});
