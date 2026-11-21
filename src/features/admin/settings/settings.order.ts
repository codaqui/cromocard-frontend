import type { DefaultCategory } from './settings.types';

function inOrder(categories: DefaultCategory[]): DefaultCategory[] {
  return categories.map((category, position) => ({ ...category, displayOrder: position }));
}

export function pinnedFirst(categories: DefaultCategory[]): DefaultCategory[] {
  return inOrder([
    ...categories.filter(({ isPinned }) => isPinned),
    ...categories.filter(({ isPinned }) => !isPinned),
  ]);
}

export function canMoveCategory(categories: DefaultCategory[], from: number, to: number): boolean {
  const moved = categories[from];
  if (!moved || to < 0 || to >= categories.length || from === to) return false;
  const pinnedSlots = categories.filter(({ isPinned }) => isPinned).length;
  return !moved.isPinned && to >= pinnedSlots;
}

function relocate(categories: DefaultCategory[], from: number, to: number): DefaultCategory[] {
  const moved = categories.slice(from, from + 1);
  const rest = categories.filter((_, position) => position !== from);
  return inOrder([...rest.slice(0, to), ...moved, ...rest.slice(to)]);
}

export function moveCategory(
  categories: DefaultCategory[],
  from: number,
  to: number,
): DefaultCategory[] {
  return canMoveCategory(categories, from, to) ? relocate(categories, from, to) : categories;
}

export function togglePinned(categories: DefaultCategory[], id: string): DefaultCategory[] {
  const target = categories.find((category) => category.id === id);
  if (!target) return categories;
  if (target.isPinned) {
    return categories.map((category) =>
      category.id === id ? { ...category, isPinned: false } : category,
    );
  }
  const unpinned = categories.map((category) => ({ ...category, isPinned: category.id === id }));
  return relocate(unpinned, categories.indexOf(target), 0);
}
