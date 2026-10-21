import type { PaginationParams } from '@/types/api';

export type AlbumStatus = 'ACTIVE' | 'INACTIVE';
export type UploadFolder = 'cards' | 'albums' | 'banners';

export interface NamedRef {
  id: string;
  name: string;
}

export interface Rarity extends NamedRef {
  sortOrder: number;
}

export interface Language extends NamedRef {
  code: string;
}

export interface AlbumView {
  id: string;
  title: string;
  publisher: string | null;
  year: number | null;
  description: string | null;
  coverUrl: string | null;
  totalCards: number;
  status: AlbumStatus;
  createdAt: string;
  category: { id: string; name: string; slug: string } | null;
}

export interface CardView {
  id: string;
  name: string;
  number: string | null;
  description: string | null;
  frontImageUrl: string | null;
  backImageUrl: string | null;
  createdAt: string;
  album: { id: string; title: string } | null;
  category: NamedRef | null;
  rarity: NamedRef | null;
  language: Language | null;
}

export interface ListAlbumsParams extends PaginationParams {
  search?: string;
  categoryId?: string;
  status?: AlbumStatus;
}

export interface ListCardsParams extends PaginationParams {
  search?: string;
  albumId?: string;
  categoryId?: string;
  rarityId?: string;
  languageId?: string;
}

export interface AlbumInput {
  title: string;
  categoryId: string;
  year: number;
  publisher?: string;
  description?: string;
  coverUrl?: string;
  totalCards?: number;
  status?: AlbumStatus;
}

export interface CardInput {
  name: string;
  number: string;
  albumId: string;
  categoryId: string;
  rarityId: string;
  languageId: string;
  description?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
}

export interface StoredFile {
  key: string;
  url: string;
}
