import type { PaginatedResponse } from '@/types/api';

import type { Album, Card, CatalogReference, Category } from '../catalog.types';

const TIMESTAMP = '2026-11-05T12:00:00.000Z';

export const rarity: CatalogReference = {
  id: '0190f3a4-0000-7000-8000-000000000001',
  name: 'Lendária',
};

export const language: CatalogReference = {
  id: '0190f3a4-0000-7000-8000-000000000004',
  name: 'Português',
};

export const cardCategory: Category = {
  id: '0190f3a4-0000-7000-8000-000000000002',
  name: 'Seleções',
  type: 'CARD',
  parentCategoryId: null,
  parentCategory: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

export const albumCategory: Category = {
  ...cardCategory,
  id: '0190f3a4-0000-7000-8000-000000000003',
  name: 'Futebol',
  type: 'ALBUM',
};

export const album: Album = {
  id: '0190f3a4-0000-7000-8000-000000000010',
  title: 'Copa 2026',
  publisher: 'Panini',
  year: 2026,
  description: null,
  coverUrl: null,
  totalCards: 670,
  categoryId: null,
  category: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

export const card: Card = {
  id: '0190f3a4-0000-7000-8000-000000000020',
  name: 'Pelé',
  number: '10',
  description: null,
  frontImageUrl: 'https://hml-api.cromocard.com.br/uploads/cards/pele.webp',
  backImageUrl: null,
  albumId: album.id,
  categoryId: cardCategory.id,
  rarityId: rarity.id,
  languageId: null,
  album: { id: album.id, title: album.title, publisher: 'Panini', year: 2026, totalCards: 670 },
  category: { id: cardCategory.id, name: cardCategory.name },
  rarity,
  language: null,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
};

export function pageOf<T>(data: T[], totalPages = 1): PaginatedResponse<T> {
  return { data, meta: { page: 1, pageSize: 20, total: data.length, totalPages } };
}
