import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { catalogApi } from './catalog.api';
import type { AlbumInput, CardInput, CategoryInput } from './catalog.schemas';
import type {
  ListAlbumsParams,
  ListCardsParams,
  ListCategoriesParams,
  UpdateCatalogItem,
} from './catalog.types';

export const catalogKeys = {
  all: ['catalog'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  albums: (params: ListAlbumsParams) => [...catalogKeys.lists(), 'albums', params] as const,
  cards: (params: ListCardsParams) => [...catalogKeys.lists(), 'cards', params] as const,
  categories: (params: ListCategoriesParams) =>
    [...catalogKeys.lists(), 'categories', params] as const,
  rarities: () => [...catalogKeys.all, 'rarities'] as const,
  languages: () => [...catalogKeys.all, 'languages'] as const,
};

function useCatalogMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogKeys.lists() }),
  });
}

export function useAlbumsList(params: ListAlbumsParams) {
  return useQuery({
    queryKey: catalogKeys.albums(params),
    queryFn: () => catalogApi.listAlbums(params),
    placeholderData: keepPreviousData,
  });
}

export function useCardsList(params: ListCardsParams) {
  return useQuery({
    queryKey: catalogKeys.cards(params),
    queryFn: () => catalogApi.listCards(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategoriesList(params: ListCategoriesParams) {
  return useQuery({
    queryKey: catalogKeys.categories(params),
    queryFn: () => catalogApi.listCategories(params),
    placeholderData: keepPreviousData,
  });
}

export function useRarities() {
  return useQuery({ queryKey: catalogKeys.rarities(), queryFn: catalogApi.listRarities });
}

export function useLanguages() {
  return useQuery({ queryKey: catalogKeys.languages(), queryFn: catalogApi.listLanguages });
}

export function useCreateAlbum() {
  return useCatalogMutation(catalogApi.createAlbum);
}

export function useUpdateAlbum() {
  return useCatalogMutation(({ id, input }: UpdateCatalogItem<AlbumInput>) =>
    catalogApi.updateAlbum(id, input),
  );
}

export function useDeleteAlbum() {
  return useCatalogMutation(catalogApi.deleteAlbum);
}

export function useCreateCard() {
  return useCatalogMutation(catalogApi.createCard);
}

export function useUpdateCard() {
  return useCatalogMutation(({ id, input }: UpdateCatalogItem<CardInput>) =>
    catalogApi.updateCard(id, input),
  );
}

export function useDeleteCard() {
  return useCatalogMutation(catalogApi.deleteCard);
}

export function useCreateCategory() {
  return useCatalogMutation(catalogApi.createCategory);
}

export function useUpdateCategory() {
  return useCatalogMutation(({ id, input }: UpdateCatalogItem<CategoryInput>) =>
    catalogApi.updateCategory(id, input),
  );
}

export function useDeleteCategory() {
  return useCatalogMutation(catalogApi.deleteCategory);
}
