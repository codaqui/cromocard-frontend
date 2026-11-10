import { useAlbumsList, useCardsList, useCategoriesList } from '../catalog.queries';

const TOTAL_ONLY = { page: 1, pageSize: 1 };

export interface CatalogTotals {
  cards?: number;
  albums?: number;
  categories?: number;
}

export function useCatalogTotals(): CatalogTotals {
  return {
    cards: useCardsList(TOTAL_ONLY).data?.meta.total,
    albums: useAlbumsList(TOTAL_ONLY).data?.meta.total,
    categories: useCategoriesList(TOTAL_ONLY).data?.meta.total,
  };
}
