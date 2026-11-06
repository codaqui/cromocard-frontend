import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { downloadFile } from '@/lib/download-file';

import { catalogApi } from './catalog.api';
import type { AlbumInput, CardInput, CategoryInput } from './catalog.schemas';
import type {
  CatalogItemRef,
  ListAlbumsParams,
  ListCardsParams,
  ListCategoriesParams,
  UploadImageVariables,
} from './catalog.types';

const IMPORT_TEMPLATE_FILE_NAME = 'modelo-importacao-cartas.csv';

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

export function useSaveAlbum(id?: string) {
  return useCatalogMutation((input: AlbumInput) =>
    id ? catalogApi.updateAlbum(id, input) : catalogApi.createAlbum(input),
  );
}

export function useSaveCard(id?: string) {
  return useCatalogMutation((input: CardInput) =>
    id ? catalogApi.updateCard(id, input) : catalogApi.createCard(input),
  );
}

export function useSaveCategory(id?: string) {
  return useCatalogMutation((input: CategoryInput) =>
    id ? catalogApi.updateCategory(id, input) : catalogApi.createCategory(input),
  );
}

export function useDeleteCatalogItem() {
  return useCatalogMutation(({ kind, id }: CatalogItemRef) => catalogApi.deleteItem(kind, id));
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ folder, file }: UploadImageVariables) => catalogApi.uploadImage(folder, file),
  });
}

export function useImportCards() {
  return useCatalogMutation((file: File) => catalogApi.importCards(file));
}

export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: async () =>
      downloadFile(await catalogApi.downloadImportTemplate(), IMPORT_TEMPLATE_FILE_NAME),
  });
}
