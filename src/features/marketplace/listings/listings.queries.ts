import { useInfiniteQuery } from '@tanstack/react-query';

import { listingsApi } from './listings.api';

export const CARD_LISTINGS_PAGE_SIZE = 20;

export const listingsKeys = {
  all: ['listings'] as const,
  byCard: (cardId: string) => [...listingsKeys.all, 'card', cardId] as const,
};

export function useCardListings(cardId: string, enabled = true) {
  return useInfiniteQuery({
    enabled,
    queryKey: listingsKeys.byCard(cardId),
    queryFn: ({ pageParam }) =>
      listingsApi.listByCard(cardId, { page: pageParam, pageSize: CARD_LISTINGS_PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: ({ meta }) => (meta.page < meta.totalPages ? meta.page + 1 : undefined),
  });
}
