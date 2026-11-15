import { describe, expect, it, vi } from 'vitest';

import { listSummary, searchChip, selectChips } from './catalog.filter-chips';

const raritySelect = {
  name: 'rarityId' as const,
  label: 'Raridade',
  chipLabel: 'Raridade',
  placeholder: 'Todas as raridades',
  icon: 'diamond' as const,
  options: [{ value: 'rara', label: 'Rara' }],
};

describe('catalog.filter-chips', () => {
  it('CA1: o chip usa o nome da opção e, sem ela carregada, o valor escolhido', () => {
    const onRemove = vi.fn();
    const known = selectChips({ selects: [raritySelect], values: { rarityId: 'rara' }, onRemove });
    const unknown = selectChips({ selects: [raritySelect], values: { rarityId: 'x9' }, onRemove });

    expect(known[0]?.label).toBe('Raridade: Rara');
    expect(unknown[0]?.label).toBe('Raridade: x9');
    known[0]?.onRemove();
    expect(onRemove).toHaveBeenCalledWith('rarityId');
  });

  it('CA1: filtro vazio não vira chip, e a busca só vira chip com texto', () => {
    expect(
      selectChips({ selects: [raritySelect], values: { rarityId: '' }, onRemove: vi.fn() }),
    ).toEqual([]);
    expect(searchChip('   ', vi.fn())).toEqual([]);
    expect(searchChip(' Pelé ', vi.fn())[0]?.label).toBe('Busca: Pelé');
  });

  it('R3: o total da lista usa singular e plural, e espera os dados chegarem', () => {
    const noun = { one: 'carta encontrada', many: 'cartas encontradas' };

    expect(listSummary(undefined, noun)).toBeUndefined();
    expect(listSummary(1, noun)).toBe('1 carta encontrada');
    expect(listSummary(184350, noun)).toBe('184.350 cartas encontradas');
  });
});
