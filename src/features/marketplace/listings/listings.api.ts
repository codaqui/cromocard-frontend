import { api } from '@/lib/http';

import type { CreateListingInput } from './listings.schemas';
import type {
  CardCondition,
  CardOption,
  CreatedListing,
  ListingEligibility,
  StoredListingPhoto,
} from './listings.types';

const CARD_SEARCH_PAGE_SIZE = 10;

function photoForm(file: File): FormData {
  const form = new FormData();
  form.append('folder', 'listings');
  form.append('file', file);
  return form;
}

export const listingsApi = {
  getEligibility: () => api.get<ListingEligibility>('/me/listings/eligibility'),
  create: (input: CreateListingInput) => api.post<CreatedListing>('/me/listings', input),
  searchCards: (q: string) =>
    api.getPage<CardOption>('/cards', { q, pageSize: CARD_SEARCH_PAGE_SIZE }),
  listConditions: () => api.get<CardCondition[]>('/card-conditions'),
  uploadPhoto: (file: File) => api.post<StoredListingPhoto>('/uploads', photoForm(file)),
};
