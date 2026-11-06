import { api } from '@/lib/http';

import type { AlbumInput, CardInput, CategoryInput } from './catalog.schemas';
import type {
  Album,
  Card,
  CatalogReference,
  Category,
  CatalogItemKind,
  ListAlbumsParams,
  ListCardsParams,
  ListCategoriesParams,
  StoredImage,
  UploadFolder,
} from './catalog.types';

const BASE_PATH = '/admin/catalog';
const ALBUMS_PATH = `${BASE_PATH}/albums`;
const CARDS_PATH = `${BASE_PATH}/cards`;
const CATEGORIES_PATH = `${BASE_PATH}/categories`;
const UPLOADS_PATH = '/uploads';

const itemPathByKind: Record<CatalogItemKind, string> = {
  card: CARDS_PATH,
  album: ALBUMS_PATH,
  category: CATEGORIES_PATH,
};

function imageForm(folder: UploadFolder, file: File): FormData {
  const form = new FormData();
  form.append('folder', folder);
  form.append('file', file);
  return form;
}

export const catalogApi = {
  listAlbums: (params: ListAlbumsParams) => api.getPage<Album>(ALBUMS_PATH, params),
  createAlbum: (input: AlbumInput) => api.post<Album>(ALBUMS_PATH, input),
  updateAlbum: (id: string, input: AlbumInput) => api.patch<Album>(`${ALBUMS_PATH}/${id}`, input),

  listCards: (params: ListCardsParams) => api.getPage<Card>(CARDS_PATH, params),
  createCard: (input: CardInput) => api.post<Card>(CARDS_PATH, input),
  updateCard: (id: string, input: CardInput) => api.patch<Card>(`${CARDS_PATH}/${id}`, input),

  listCategories: (params: ListCategoriesParams) => api.getPage<Category>(CATEGORIES_PATH, params),
  createCategory: (input: CategoryInput) => api.post<Category>(CATEGORIES_PATH, input),
  updateCategory: (id: string, input: CategoryInput) =>
    api.patch<Category>(`${CATEGORIES_PATH}/${id}`, input),

  listRarities: () => api.get<CatalogReference[]>(`${BASE_PATH}/rarities`),
  listLanguages: () => api.get<CatalogReference[]>(`${BASE_PATH}/languages`),

  deleteItem: (kind: CatalogItemKind, id: string) => api.delete(`${itemPathByKind[kind]}/${id}`),
  uploadImage: (folder: UploadFolder, file: File) =>
    api.post<StoredImage>(UPLOADS_PATH, imageForm(folder, file)),
};
