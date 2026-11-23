import type { SelectOption } from '@/components/Select/Select';

import {
  useAlbumsList,
  useCatalogSummary,
  useCategoriesList,
  useLanguages,
  useRarities,
} from '../catalog.queries';
import type { AlbumReference, Card, CardAlbum, CatalogReference, Category } from '../catalog.types';

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

export function useCategoryOptions(current?: SelectOption): SelectOption[] {
  const { data } = useCategoriesList(OPTIONS_PAGE);
  return withCurrentOption(referenceOptionsOf(data?.data), current);
}

export function useAlbumOptions(current?: SelectOption): SelectOption[] {
  const { data } = useAlbumsList(OPTIONS_PAGE);
  const options = (data?.data ?? []).map((album) => ({ value: album.id, label: album.title }));
  return withCurrentOption(options, current);
}

export function useAlbumYearOptions(): SelectOption[] {
  const years = useCatalogSummary().data?.albumYears ?? [];
  return years.map((year) => ({ value: String(year), label: String(year) }));
}

/** A própria categoria e todas as que descendem dela: nenhuma pode ser a categoria pai (L9). */
export function selfAndDescendantIdsOf(categories: Category[], rootId?: string): Set<string> {
  const ids = new Set<string>(rootId ? [rootId] : []);
  const isNewChild = ({ id, parentCategoryId }: Category) =>
    !ids.has(id) && parentCategoryId !== null && ids.has(parentCategoryId);
  let children = categories.filter(isNewChild);
  while (children.length > 0) {
    children.forEach(({ id }) => ids.add(id));
    children = categories.filter(isNewChild);
  }
  return ids;
}

export function useParentCategoryOptions(category?: Category): SelectOption[] {
  const { data } = useCategoriesList(OPTIONS_PAGE);
  const categories = data?.data ?? [];
  const blocked = selfAndDescendantIdsOf(categories, category?.id);
  const options = referenceOptionsOf(categories.filter(({ id }) => !blocked.has(id)));
  return withCurrentOption(options, optionOfReference(category?.parentCategory));
}

/**
 * Franquia do álbum escolhido, que a carta passa a ter (L11). O select só oferece os álbuns da
 * primeira página e o da própria carta (L9); o da carta já tem a franquia dele na carta.
 */
export function useAlbumCategoryOf(card?: Card): (albumId: string) => string | null {
  const { data } = useAlbumsList(OPTIONS_PAGE);
  return (albumId) => {
    const listed = data?.data.find(({ id }) => id === albumId);
    if (listed) return listed.categoryId;
    return card?.albumId === albumId ? card.categoryId : null;
  };
}

/** `current` mantém a raridade da carta na lista enquanto as opções carregam, como no álbum. */
export function useRarityOptions(current?: SelectOption): SelectOption[] {
  return withCurrentOption(referenceOptionsOf(useRarities().data), current);
}

export function useLanguageOptions(current?: SelectOption): SelectOption[] {
  return withCurrentOption(referenceOptionsOf(useLanguages().data), current);
}

/** Total de cartas do álbum escolhido, para a numeração "004 / 102" do formulário (L5). */
export function useAlbumTotal(albumId: string, current?: CardAlbum | null): number | undefined {
  const { data } = useAlbumsList(OPTIONS_PAGE);
  const album = data?.data.find(({ id }) => id === albumId);
  if (album) return album.totalCards;
  return current?.id === albumId ? current.totalCards : undefined;
}
