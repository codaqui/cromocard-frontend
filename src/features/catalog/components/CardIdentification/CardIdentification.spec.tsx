import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CardIdentification } from './CardIdentification';

function valueOf(label: string): string | null {
  const term = screen.getByText(label, { selector: 'dt' });
  return term.nextElementSibling?.textContent ?? null;
}

describe('CardIdentification', () => {
  it('CA1: mostra número, coleção, categoria, raridade e idioma da carta', () => {
    render(
      <CardIdentification
        identification={{
          number: '10',
          album: { id: 'a', title: 'Copa do Mundo 2026' },
          category: { id: 'c', name: 'Seleções' },
          rarity: { id: 'r', name: 'Lendária' },
          language: { id: 'l', name: 'Português - Brasil' },
        }}
      />,
    );

    expect(valueOf('Número')).toBe('10');
    expect(valueOf('Coleção')).toBe('Copa do Mundo 2026');
    expect(valueOf('Categoria')).toBe('Seleções');
    expect(valueOf('Raridade')).toBe('Lendária');
    expect(valueOf('Idioma')).toBe('Português - Brasil');
  });

  it('mostra o traço no dado que a carta não tem', () => {
    render(
      <CardIdentification
        identification={{
          number: '7',
          album: null,
          category: null,
          rarity: null,
          language: null,
        }}
      />,
    );

    const grid = screen.getByLabelText('Identificação da carta');
    expect(valueOf('Número')).toBe('7');
    expect(within(grid).getAllByText('—')).toHaveLength(4);
  });
});
