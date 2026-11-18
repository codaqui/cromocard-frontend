import { describe, expect, it } from 'vitest';

import { canMoveCategory, moveCategory, togglePinned } from './settings.order';
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

  it('CA9: desafixada, a categoria pode ser movida e continua onde foi deixada', () => {
    const free = togglePinned(togglePinned(list, 'c-pokemon'), 'c-pokemon');
    const moved = moveCategory(free, 0, 2);

    expect(idsOf(moved)).toEqual(['c-magic', 'c-futebol', 'c-pokemon']);
    expect(moved.some(({ isPinned }) => isPinned)).toBe(false);
  });

  it('ignora um id que não está na lista', () => {
    expect(togglePinned(list, 'c-nao-existe')).toBe(list);
  });
});

describe('categoria fixada no topo (L21)', () => {
  const pinned = togglePinned(list, 'c-pokemon');

  it('CA17: a fixada não desce', () => {
    expect(moveCategory(pinned, 0, 1)).toBe(pinned);
    expect(canMoveCategory(pinned, 0, 1)).toBe(false);
  });

  it('CA17: nenhuma outra passa por cima da fixada, subindo ou arrastando', () => {
    expect(moveCategory(pinned, 1, 0)).toBe(pinned);
    expect(moveCategory(pinned, 2, 0)).toBe(pinned);
    expect(canMoveCategory(pinned, 1, 0)).toBe(false);
  });

  it('CA17: as outras continuam se movendo entre si abaixo da fixada', () => {
    expect(idsOf(moveCategory(pinned, 2, 1))).toEqual(['c-pokemon', 'c-futebol', 'c-magic']);
    expect(canMoveCategory(pinned, 2, 1)).toBe(true);
  });

  it('CA17: ao desafixar, a categoria volta a poder se mover', () => {
    const free = togglePinned(pinned, 'c-pokemon');

    expect(canMoveCategory(free, 0, 1)).toBe(true);
  });
});
