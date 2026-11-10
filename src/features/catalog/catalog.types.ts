import type { PaginationParams } from '@/types/api';

export const CATEGORY_TYPES = ['ALBUM', 'CARD'] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export interface CatalogReference {
  id: string;
  name: string;
}

export interface AlbumReference {
  id: string;
  title: string;
}

export interface CardAlbum extends AlbumReference {
  publisher: string | null;
  year: number | null;
  totalCards: number;
}

export interface Album {
  id: string;
  title: string;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverUrl: string | null;
  totalCards: number;
  categoryId: string | null;
  category: CatalogReference | null;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  name: string;
  number: string | null;
  description: string | null;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  albumId: string | null;
  categoryId: string | null;
  rarityId: string | null;
  languageId: string | null;
  album: CardAlbum | null;
  category: CatalogReference | null;
  rarity: CatalogReference | null;
  language: CatalogReference | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  parentCategoryId: string | null;
  parentCategory: CatalogReference | null;
  createdAt: string;
  updatedAt: string;
}

interface SearchParams extends PaginationParams {
  q?: string;
}

export interface ListAlbumsParams extends SearchParams {
  categoryId?: string;
  year?: number;
}

export interface ListCardsParams extends SearchParams {
  albumId?: string;
  categoryId?: string;
  rarityId?: string;
}

export type ListCategoriesParams = SearchParams;

export interface CatalogTabProps {
  pageSize: number;
  notify: (message: string) => void;
}

export type CatalogItemKind = 'card' | 'album' | 'category';

export interface CatalogItemRef {
  kind: CatalogItemKind;
  id: string;
  name: string;
}

export type UploadFolder = 'cards' | 'albums';

export interface StoredImage {
  key: string;
  url: string;
}

export interface UploadImageVariables {
  folder: UploadFolder;
  file: File;
}

export interface CardImportResult {
  created: number;
}
