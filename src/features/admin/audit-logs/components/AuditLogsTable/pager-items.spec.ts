import { describe, expect, it } from 'vitest';

import { pagerItems } from './pager-items';

describe('pagerItems', () => {
  it('mostra todas as páginas quando são poucas', () => {
    expect(pagerItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('mostra o começo, as reticências e a última página, como no Figma', () => {
    expect(pagerItems(1, 214)).toEqual([1, 2, 3, 'gap-end', 214]);
  });

  it('centraliza a página atual no meio da lista', () => {
    expect(pagerItems(50, 214)).toEqual([1, 'gap-start', 49, 50, 51, 'gap-end', 214]);
  });

  it('mostra as últimas páginas no fim da lista', () => {
    expect(pagerItems(213, 214)).toEqual([1, 'gap-start', 212, 213, 214]);
  });
});
