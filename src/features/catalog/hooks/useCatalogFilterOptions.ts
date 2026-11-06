import type { SelectOption } from '@/components/Select/Select';

import { useAlbumsList, useCategoriesList, useLanguages, useRarities } from '../catalog.queries';
import type { CatalogReference, Category, CategoryType } from '../catalog.types';

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

function referenceOptionsOf(references: CatalogReference[] = []): SelectOption[] {
  return references.map((reference) => ({ value: reference.id, label: reference.name }));
}

export function useParentCategoryOptions(excludedId?: string): SelectOption[] {
  const { data } = useCategoriesList(OPTIONS_PAGE);
  return referenceOptionsOf(data?.data.filter((category) => category.id !== excludedId));
}

export function useRarityOptions(): SelectOption[] {
  return referenceOptionsOf(useRarities().data);
}

export function useLanguageOptions(): SelectOption[] {
  return referenceOptionsOf(useLanguages().data);
}
