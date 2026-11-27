export interface CardOption {
  id: string;
  name: string;
  number: string | null;
  frontImageUrl: string | null;
  album: { id: string; title: string } | null;
  category: { id: string; name: string } | null;
}

export interface CardCondition {
  id: string;
  name: string;
  sortOrder: number;
}

export interface ListingEligibility {
  canCreate: boolean;
  stripeAccountReady: boolean;
  hasPrimaryAddress: boolean;
}

export interface CreatedListing {
  id: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  price: string;
  platformFee: string;
  netAmount: string;
  availableQuantity: number;
  description: string | null;
  card: { id: string; name: string };
  condition: { id: string; name: string } | null;
  photos: { url: string; sortOrder: number }[];
}

export interface StoredListingPhoto {
  key: string;
  url: string;
}

export const MAX_LISTING_PHOTOS = 4;
export const INITIAL_PHOTO_SLOTS = 2;
