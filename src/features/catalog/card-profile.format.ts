import type { CardProfile } from './card-profile.types';

export const EMPTY_VALUE = '—';

export function galleryImagesOf({ images }: CardProfile): string[] {
  return [images.front, images.back, ...images.photos].filter((url): url is string => url !== null);
}

export function badgesOf({ identification }: CardProfile): string[] {
  const { rarity, album, category } = identification;
  return [rarity?.name, album?.title, category?.name].filter(
    (label): label is string => label !== undefined,
  );
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
