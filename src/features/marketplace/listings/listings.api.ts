import { api } from '@/lib/http';

import type { CardListingsParams, ListingSummary } from './listings.types';

export const listingsApi = {
  listByCard: (cardId: string, params: CardListingsParams) =>
    api.getPage<ListingSummary>(`/cards/${cardId}/listings`, { ...params, sort: 'price' }),
};
