import type { SelectOption } from '@/components/Select/Select';

import { filtersStateOf, listSummary, selectChips } from '../../catalog.filter-chips';
import { formatEdition } from '../../catalog.format';
import { useCardsList } from '../../catalog.queries';
import type { Card, CatalogTabProps } from '../../catalog.types';
import {
  useAlbumOptions,
  useCategoryOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import {
  AlbumNumberCell,
  EditionCell,
  FranchiseBadge,
  Thumbnail,
  TitleCell,
} from '../CatalogCells/CatalogCells';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import {
  CatalogFilterSelect,
  type CatalogFilterSelectConfig,
} from '../CatalogFilterSelect/CatalogFilterSelect';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { CardFormModal } from '../CardFormModal/CardFormModal';
import styles from './CardsTab.module.css';

const cardsTable: CatalogTable<Card> = {
  caption: 'Cartas do catálogo',
  emptyTitle: 'Nenhuma carta encontrada',
  columns: [
    {
      key: 'image',
      header: 'Carta & imagem',
      render: (card) => <Thumbnail imageUrl={card.frontImageUrl} badge={card.rarity?.name} />,
    },
    {
      key: 'name',
      header: 'Nome oficial & idioma',
      render: (card) => <TitleCell title={card.name} tags={[card.language?.name]} />,
    },
    {
      key: 'album',
      header: 'Álbum / coleção vinculada',
      render: ({ album }) => (
        <EditionCell title={album?.title} edition={album && formatEdition(album)} />
      ),
    },
    {
      key: 'category',
      header: 'Franquia',
      render: (card) => <FranchiseBadge name={card.category?.name} />,
    },
    {
      key: 'number',
      header: 'Nº álbum',
      render: (card) => <AlbumNumberCell number={card.number} total={card.album?.totalCards} />,
    },
  ],
};

const cardFiltersTexts = {
  label: 'Filtros das cartas',
  searchLabel: 'Buscar carta pelo nome ou número',
  searchPlaceholder: 'Buscar por nome ou número da carta…',
};

const initialFilters = { categoryId: '', rarityId: '', albumId: '' };

type CardFilterName = keyof typeof initialFilters;

type CardFilterSelect = CatalogFilterSelectConfig<CardFilterName>;

function cardsTableWith(dialogs: CatalogItemDialogs<Card>): CatalogTable<Card> {
  const actions = catalogActionsColumn<Card>('card', (card) => card.name, dialogs);
  return { ...cardsTable, columns: [...cardsTable.columns, actions] };
}

function renderCardForm(dialogs: CatalogItemDialogs<Card>) {
  return (card?: Card) => (
    <CardFormModal card={card} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

function franchiseSelect(options: SelectOption[]): CardFilterSelect {
  return {
    name: 'categoryId',
    label: 'Franquia',
    chipLabel: 'Franquia',
    placeholder: 'Todas as Franquias',
    icon: 'gamepad',
    options,
  };
}

function useCardFilterSelects(): CardFilterSelect[] {
  return [
    franchiseSelect(useCategoryOptions('CARD')),
    {
      name: 'rarityId',
      label: 'Raridade',
      chipLabel: 'Raridade',
      placeholder: 'Todas as Raridades',
      icon: 'diamond',
      options: useRarityOptions(),
    },
    {
      name: 'albumId',
      label: 'Álbum',
      chipLabel: 'Álbum',
      placeholder: 'Todos os Álbuns',
      icon: 'calendar',
      options: useAlbumOptions(),
    },
  ];
}

interface CardFiltersProps {
  list: CatalogListFilters<typeof initialFilters>;
  summary?: string;
}

function CardFilters({ list, summary }: CardFiltersProps) {
  const selects = useCardFilterSelects();
  const onRemove = (name: CardFilterName) => list.changeFilter(name, '');
  const chips = selectChips({ selects, values: list.filters, onRemove });
  const state = filtersStateOf(list, chips, summary);

  return (
    <CatalogFilters texts={cardFiltersTexts} state={state}>
      {selects.map((select) => (
        <CatalogFilterSelect
          key={select.name}
          select={select}
          value={list.filters[select.name]}
          onChange={list.changeFilter}
        />
      ))}
    </CatalogFilters>
  );
}

export function CardsTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const cardsQuery = useCardsList(list.params);
  const dialogs = useCatalogItemDialogs<Card>(notify);
  const result = cardsQuery.data;

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderCardForm(dialogs)} />
      <CardFilters
        list={list}
        summary={listSummary(result?.data.length, result?.meta.total, 'cartas')}
      />
      <CatalogListResult
        query={cardsQuery}
        table={cardsTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
