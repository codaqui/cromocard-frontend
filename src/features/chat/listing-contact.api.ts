import { api } from '@/lib/http';

import type { ListingContact } from './chat.types';

export const listingContactApi = {
  contact: (listingId: string) => api.post<ListingContact>(`/listings/${listingId}/contact`),
};
