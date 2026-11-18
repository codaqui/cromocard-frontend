import { slugify } from '@/lib/slug';

import type { CategoryOption, DefaultCategory } from '../settings.types';

export function defaultCategory(
  id: string,
  name: string,
  extra: Partial<DefaultCategory> = {},
): DefaultCategory {
  return {
    id,
    name,
    slug: slugify(name),
    badge: null,
    isPinned: false,
    displayOrder: 0,
    cardsCount: 0,
    backImageUrl: null,
    ...extra,
  };
}

export function categoryOption(
  id: string,
  name: string,
  parentCategoryId: string | null = null,
): CategoryOption {
  return {
    id,
    name,
    slug: slugify(name),
    badge: null,
    cardsCount: 0,
    parentCategoryId,
  };
}
