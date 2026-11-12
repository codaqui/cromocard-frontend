import { describe, expect, it } from 'vitest';

import { pageSlots } from './catalog-pages';

describe('pageSlots', () => {
  it('mostra todas as páginas quando cabem na janela', () => {
    expect(pageSlots(1, 2)).toEqual([1, 2]);
    expect(pageSlots(2, 3)).toEqual([1, 2, 3]);
  });

  it('mostra a janela, as reticências e a última página', () => {
    expect(pageSlots(1, 3687)).toEqual([1, 2, 3, 'gap', 3687]);
    expect(pageSlots(10, 3687)).toEqual([9, 10, 11, 'gap', 3687]);
  });

  it('junta a última página sem reticências quando ela vem logo depois', () => {
    expect(pageSlots(3, 5)).toEqual([2, 3, 4, 5]);
  });

  it('termina na última página sem repetir', () => {
    expect(pageSlots(3687, 3687)).toEqual([3685, 3686, 3687]);
  });
});
