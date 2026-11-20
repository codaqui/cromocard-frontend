import type { TabItem } from '@/components/Tabs/Tabs';

import type { CatalogRequestType, RequestTab } from './catalog-requests.types';

export const REQUESTS_PAGE_SIZE = 10;

const TAB_LABELS: Record<RequestTab, string> = {
  ALL: 'Todas',
  CARD: 'Cartas',
  ALBUM: 'Álbuns',
  CATEGORY: 'Categorias',
};

export function requestTabs(pending?: Record<RequestTab, number>): TabItem<RequestTab>[] {
  return (Object.keys(TAB_LABELS) as RequestTab[]).map((id) => ({
    id,
    label: TAB_LABELS[id],
    count: pending?.[id],
  }));
}

export interface RequestTypeText {
  badge: string;
  section: string;
  approvalNote: string;
  entersAsSuggested: string;
}

export const requestTypeTexts: Record<CatalogRequestType, RequestTypeText> = {
  CARD: {
    badge: 'Nova carta sugerida',
    section: 'Registro sugerido',
    approvalNote:
      'Ao aprovar, a carta entra no catálogo como foi sugerida. Ajustes depois, na Gestão de Catálogo.',
    entersAsSuggested: 'A carta entra no catálogo como foi sugerida',
  },
  ALBUM: {
    badge: 'Novo álbum sugerido',
    section: 'Álbum sugerido',
    approvalNote:
      'Ao aprovar, o álbum entra no catálogo. As cartas são cadastradas depois, na Gestão de Catálogo.',
    entersAsSuggested: 'O álbum entra no catálogo como foi sugerido',
  },
  CATEGORY: {
    badge: 'Nova categoria sugerida',
    section: 'Categoria sugerida',
    approvalNote: 'Ao aprovar, a categoria entra no catálogo como foi sugerida.',
    entersAsSuggested: 'A categoria entra no catálogo como foi sugerida',
  },
};

export const CATEGORY_TYPE_LABELS = { ALBUM: 'Categoria de álbuns', CARD: 'Franquia de cartas' };
