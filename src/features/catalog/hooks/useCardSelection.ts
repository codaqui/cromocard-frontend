import { useState } from 'react';

import type { Card } from '../catalog.types';

export interface CardSelection {
  selected: Card[];
  isSelected: (id: string) => boolean;
  areAllSelected: (cards: Card[]) => boolean;
  toggle: (card: Card) => void;
  togglePage: (cards: Card[]) => void;
  clear: () => void;
}

function withoutCards(current: Map<string, Card>, cards: Card[]) {
  const next = new Map(current);
  cards.forEach(({ id }) => next.delete(id));
  return next;
}

function withCards(current: Map<string, Card>, cards: Card[]) {
  const next = new Map(current);
  cards.forEach((card) => next.set(card.id, card));
  return next;
}

/** Cartas marcadas na lista para a exclusão em lote (CCD105, R10), mesmo trocando de página. */
export function useCardSelection(): CardSelection {
  const [selection, setSelection] = useState(new Map<string, Card>());
  const areAllSelected = (cards: Card[]) =>
    cards.length > 0 && cards.every(({ id }) => selection.has(id));

  return {
    selected: [...selection.values()],
    isSelected: (id) => selection.has(id),
    areAllSelected,
    toggle: (card) =>
      setSelection((current) =>
        current.has(card.id) ? withoutCards(current, [card]) : withCards(current, [card]),
      ),
    togglePage: (cards) =>
      setSelection((current) =>
        areAllSelected(cards) ? withoutCards(current, cards) : withCards(current, cards),
      ),
    clear: () => setSelection(new Map()),
  };
}
