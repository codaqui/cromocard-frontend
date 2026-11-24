import type { CardProfile } from './card-profile.types';

export type CardBadgeKind = 'rarity' | 'album' | 'category';

export interface CardBadge {
  kind: CardBadgeKind;
  label: string;
}

export function galleryImagesOf({ images }: CardProfile): string[] {
  return [images.front, images.back, ...images.photos].filter((url): url is string => url !== null);
}

export function badgesOf({ identification }: CardProfile): CardBadge[] {
  const { rarity, album, category } = identification;
  const candidates: { kind: CardBadgeKind; label: string | undefined }[] = [
    { kind: 'rarity', label: rarity?.name },
    { kind: 'album', label: album?.title },
    { kind: 'category', label: category?.name },
  ];
  return candidates.filter((badge): badge is CardBadge => badge.label !== undefined);
}

export function subtitleOf({ identification }: CardProfile): string {
  const parts = [
    identification.number === null ? undefined : `Nº ${identification.number}`,
    identification.album?.title,
  ];
  return parts.filter((part) => part !== undefined).join(' • ');
}

export function breadcrumbOf(card: CardProfile): string[] {
  const middle = [card.breadcrumb.category?.name, card.identification.album?.title];
  return [
    'Início',
    'Marketplace',
    ...middle.filter((part): part is string => part !== undefined),
    card.name,
  ];
}
