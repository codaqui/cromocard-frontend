import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { listingsApi } from './listings.api';

export const MIN_CARD_SEARCH_LENGTH = 2;

export const listingsKeys = {
  all: ['listings'] as const,
  eligibility: () => [...listingsKeys.all, 'eligibility'] as const,
  cardSearch: (q: string) => [...listingsKeys.all, 'card-search', q] as const,
  conditions: () => [...listingsKeys.all, 'conditions'] as const,
};

export const eligibilityQuery = () => ({
  queryKey: listingsKeys.eligibility(),
  queryFn: listingsApi.getEligibility,
  staleTime: 0,
});

export function useCardSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: listingsKeys.cardSearch(term),
    queryFn: () => listingsApi.searchCards(term),
    enabled: term.length >= MIN_CARD_SEARCH_LENGTH,
    placeholderData: keepPreviousData,
  });
}

export function useCardConditions() {
  return useQuery({
    queryKey: listingsKeys.conditions(),
    queryFn: listingsApi.listConditions,
    staleTime: Infinity,
  });
}

export function useUploadListingPhoto() {
  return useMutation({ mutationFn: listingsApi.uploadPhoto });
}

export function useCreateListing() {
  return useMutation({ mutationFn: listingsApi.create });
}
