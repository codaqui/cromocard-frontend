import type { CardOption } from './listings.types';

export function cardOptionLabel({ name, album, number }: CardOption): string {
  const withAlbum = album ? `${name} - ${album.title}` : name;
  return number ? `${withAlbum} (${number})` : withAlbum;
}

export function catalogHelpOf({ category, album }: CardOption): string {
  const origin = [category?.name, album?.title].filter(Boolean).join(' • ');
  return origin ? `Identificada no catálogo oficial ${origin}` : 'Identificada no catálogo oficial';
}

const NAMED_PHOTO_SLOTS = ['Foto Frontal', 'Foto do Verso'];

export function photoSlotLabelOf(index: number): string {
  return NAMED_PHOTO_SLOTS[index] ?? `Foto ${index + 1}`;
}

export const PHOTO_REJECTED_MESSAGE = 'Envie uma imagem PNG, JPG ou WEBP de até 4 MB.';
