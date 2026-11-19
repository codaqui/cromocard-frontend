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

function allSelected(selection: Map<string, Card>, cards: Card[]) {
  return cards.length > 0 && cards.every(({ id }) => selection.has(id));
}

export function useCardSelection(): CardSelection {
  const [selection, setSelection] = useState(new Map<string, Card>());

  return {
    selected: [...selection.values()],
    isSelected: (id) => selection.has(id),
    areAllSelected: (cards) => allSelected(selection, cards),
    toggle: (card) =>
      setSelection((current) =>
        current.has(card.id) ? withoutCards(current, [card]) : withCards(current, [card]),
      ),
    togglePage: (cards) =>
      setSelection((current) =>
        allSelected(current, cards) ? withoutCards(current, cards) : withCards(current, cards),
      ),
    clear: () => setSelection(new Map()),
  };
}
