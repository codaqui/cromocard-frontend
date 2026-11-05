import type { SelectOption } from '@/components/Select/Select';

import { useAlbumsList, useCategoriesList, useRarities } from '../catalog.queries';
import type { Category, CategoryType } from '../catalog.types';

const OPTIONS_PAGE = { page: 1, pageSize: 100 };

function categoryOptionsOf(categories: Category[], type: CategoryType): SelectOption[] {
  return categories
    .filter((category) => category.type === type)
    .map((category) => ({ value: category.id, label: category.name }));
}

export function useCategoryOptions(type: CategoryType): SelectOption[] {
  const { data } = useCategoriesList(OPTIONS_PAGE);
  return categoryOptionsOf(data?.data ?? [], type);
}

export function useAlbumOptions(): SelectOption[] {
  const { data } = useAlbumsList(OPTIONS_PAGE);
  return (data?.data ?? []).map((album) => ({ value: album.id, label: album.title }));
}

export function useRarityOptions(): SelectOption[] {
  const { data } = useRarities();
  return (data ?? []).map((rarity) => ({ value: rarity.id, label: rarity.name }));
}
