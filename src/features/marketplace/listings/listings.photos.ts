import { INITIAL_PHOTO_SLOTS, MAX_LISTING_PHOTOS } from './listings.types';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export const ACCEPTED_PHOTO_TYPES = ACCEPTED_TYPES.join(',');

export function isAcceptedPhoto(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type) && file.size <= MAX_PHOTO_BYTES;
}

export function photoSlotCount(filled: number): number {
  if (filled < INITIAL_PHOTO_SLOTS) return INITIAL_PHOTO_SLOTS;
  return Math.min(filled + 1, MAX_LISTING_PHOTOS);
}

export function withPhotoAt(photos: string[], index: number, url: string): string[] {
  const next = [...photos];
  next[index] = url;
  return next.filter(Boolean).slice(0, MAX_LISTING_PHOTOS);
}

export function withoutPhotoAt(photos: string[], index: number): string[] {
  return photos.filter((_, position) => position !== index);
}
