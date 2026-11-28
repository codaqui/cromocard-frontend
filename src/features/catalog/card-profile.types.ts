export interface NamedRef {
  id: string;
  name: string;
}

export interface CardProfile {
  id: string;
  name: string;
  images: { front: string | null; back: string | null; photos: string[] };
  breadcrumb: { category: NamedRef | null };
  identification: {
    number: string | null;
    album: { id: string; title: string } | null;
    category: NamedRef | null;
    rarity: NamedRef | null;
    language: NamedRef | null;
  };
  market: {
    averagePrice: string | null;
    lowestListingPrice: string | null;
    activeListingsCount: number;
  };
}
