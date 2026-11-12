import type { SelectOption } from '@/components/Select/Select';

import { useAlbumsList, useCategoriesList, useLanguages, useRarities } from '../catalog.queries';
import type { AlbumReference, CatalogReference, Category, CategoryType } from '../catalog.types';

const OPTIONS_PAGE = { page: 1, pageSize: 100 };

export function optionOfReference(reference?: CatalogReference | null): SelectOption | undefined {
  return reference ? { value: reference.id, label: reference.name } : undefined;
}

export function optionOfAlbum(album?: AlbumReference | null): SelectOption | undefined {
  return album ? { value: album.id, label: album.title } : undefined;
}

function withCurrentOption(options: SelectOption[], current?: SelectOption): SelectOption[] {
  if (!current || options.some((option) => option.value === current.value)) return options;
  return [current, ...options];
}

function referenceOptionsOf(references: CatalogReference[] = []): SelectOption[] {
  return references.map((reference) => ({ value: reference.id, label: reference.name }));
}

export function useCategoryOptions(type: CategoryType, current?: SelectOption): SelectOption[] {
  const { data } = useCategoriesList({ ...OPTIONS_PAGE, type });
  return withCurrentOption(referenceOptionsOf(data?.data), current);
}

export function useAlbumOptions(current?: SelectOption): SelectOption[] {
  const { data } = useAlbumsList(OPTIONS_PAGE);
  const options = (data?.data ?? []).map((album) => ({ value: album.id, label: album.title }));
  return withCurrentOption(options, current);
}

export function useParentCategoryOptions(category?: Category): SelectOption[] {
  const { data } = useCategoriesList(OPTIONS_PAGE);
  const options = referenceOptionsOf(data?.data.filter(({ id }) => id !== category?.id));
  return withCurrentOption(options, optionOfReference(category?.parentCategory));
}

export function useRarityOptions(): SelectOption[] {
  return referenceOptionsOf(useRarities().data);
}

export function useLanguageOptions(): SelectOption[] {
  return referenceOptionsOf(useLanguages().data);
}
