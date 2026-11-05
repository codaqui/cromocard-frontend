import { api } from '@/lib/http';

import type { AlbumInput, CardInput, CategoryInput } from './catalog.schemas';
import type {
  Album,
  Card,
  CatalogReference,
  Category,
  ListAlbumsParams,
  ListCardsParams,
  ListCategoriesParams,
} from './catalog.types';

const BASE_PATH = '/admin/catalog';
const ALBUMS_PATH = `${BASE_PATH}/albums`;
const CARDS_PATH = `${BASE_PATH}/cards`;
const CATEGORIES_PATH = `${BASE_PATH}/categories`;

export const catalogApi = {
  listAlbums: (params: ListAlbumsParams) => api.getPage<Album>(ALBUMS_PATH, params),
  createAlbum: (input: AlbumInput) => api.post<Album>(ALBUMS_PATH, input),
  updateAlbum: (id: string, input: AlbumInput) => api.patch<Album>(`${ALBUMS_PATH}/${id}`, input),
  deleteAlbum: (id: string) => api.delete(`${ALBUMS_PATH}/${id}`),

  listCards: (params: ListCardsParams) => api.getPage<Card>(CARDS_PATH, params),
  createCard: (input: CardInput) => api.post<Card>(CARDS_PATH, input),
  updateCard: (id: string, input: CardInput) => api.patch<Card>(`${CARDS_PATH}/${id}`, input),
  deleteCard: (id: string) => api.delete(`${CARDS_PATH}/${id}`),

  listCategories: (params: ListCategoriesParams) => api.getPage<Category>(CATEGORIES_PATH, params),
  createCategory: (input: CategoryInput) => api.post<Category>(CATEGORIES_PATH, input),
  updateCategory: (id: string, input: CategoryInput) =>
    api.patch<Category>(`${CATEGORIES_PATH}/${id}`, input),
  deleteCategory: (id: string) => api.delete(`${CATEGORIES_PATH}/${id}`),

  listRarities: () => api.get<CatalogReference[]>(`${BASE_PATH}/rarities`),
  listLanguages: () => api.get<CatalogReference[]>(`${BASE_PATH}/languages`),
};
