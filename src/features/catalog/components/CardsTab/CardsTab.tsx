import type { DataTableColumn } from '@/components/DataTable/DataTable';
import type { SelectOption } from '@/components/Select/Select';

import { filtersStateOf, listSummary, selectChips } from '../../catalog.filter-chips';
import { formatEdition } from '../../catalog.format';
import { useCardsList } from '../../catalog.queries';
import { variantLabelsOf } from '../../catalog.schemas';
import type { Card, CatalogTabProps } from '../../catalog.types';
import {
  useAlbumOptions,
  useAlbumYearOptions,
  useCategoryOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { type BulkDeletion, useBulkDeletion } from '../../hooks/useBulkDeletion';
import { type CardSelection, useCardSelection } from '../../hooks/useCardSelection';
import { BulkDeleteCardsDialog } from '../BulkDeleteCardsDialog/BulkDeleteCardsDialog';
import { BulkSelectionBar } from '../BulkSelectionBar/BulkSelectionBar';
import { cardSelectionColumn } from '../SelectionCheckbox/cardSelectionColumn';
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

const NO_CODE_LABEL = 'Sem código';

const codeLabelOf = (code: string | null) => (code ? `#${code}` : NO_CODE_LABEL);

const cardColumns: DataTableColumn<Card>[] = [
  {
    key: 'image',
    header: 'Carta',
    render: (card) => <Thumbnail imageUrl={card.frontImageUrl} badge={card.rarity?.name} />,
  },
  {
    key: 'name',
    header: 'Nome e código',
    render: (card) => (
      <TitleCell
        title={card.name}
        detail={codeLabelOf(card.code)}
        tags={variantLabelsOf(card.variants)}
      />
    ),
  },
  {
    key: 'album',
    header: 'Álbum',
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
    header: 'Nº',
    render: (card) => <AlbumNumberCell number={card.number} total={card.album?.totalCards} />,
  },
];

const cardFiltersTexts = {
  label: 'Filtros das cartas',
  searchLabel: 'Buscar carta pelo nome, número ou código',
  searchPlaceholder: 'Buscar por nome ou código…',
};

const initialFilters = { categoryId: '', albumId: '', rarityId: '', year: '' };

const cardsFound = { one: 'carta encontrada', many: 'cartas encontradas' };

type CardFilterName = keyof typeof initialFilters;

type CardFilterSelect = CatalogFilterSelectConfig<CardFilterName>;

const statusSelect: CatalogFilterSelectConfig<'status'> = {
  name: 'status',
  label: 'Status',
  chipLabel: 'Status',
  placeholder: 'Publicadas',
  icon: 'gamepad',
  options: [],
  disabled: true,
};

const noop = () => undefined;

interface CardsTableSource {
  dialogs: CatalogItemDialogs<Card>;
  selection: CardSelection;
  rows: Card[];
}

function cardsTableOf({ dialogs, selection, rows }: CardsTableSource): CatalogTable<Card> {
  const actions = catalogActionsColumn<Card>('card', (card) => card.name, dialogs);
  return {
    caption: 'Cartas do catálogo',
    emptyTitle: 'Nenhuma carta encontrada',
    columns: [cardSelectionColumn(selection, rows), ...cardColumns, actions],
  };
}

function renderCardForm(dialogs: CatalogItemDialogs<Card>) {
  return (card?: Card, source?: Card) => (
    <CardFormModal card={card} source={source} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

function franchiseSelect(options: SelectOption[]): CardFilterSelect {
  return {
    name: 'categoryId',
    label: 'Franquia',
    chipLabel: 'Franquia',
    placeholder: 'Todas as franquias',
    icon: 'gamepad',
    options,
  };
}

function yearSelect(options: SelectOption[]): CardFilterSelect {
  return {
    name: 'year',
    label: 'Ano',
    chipLabel: 'Ano',
    placeholder: 'Todos os anos',
    icon: 'calendar',
    options,
  };
}

function useCardFilterSelects(): CardFilterSelect[] {
  return [
    franchiseSelect(useCategoryOptions('CARD')),
    {
      name: 'albumId',
      label: 'Álbum',
      chipLabel: 'Álbum',
      placeholder: 'Todos os álbuns',
      icon: 'gamepad',
      options: useAlbumOptions(),
    },
    {
      name: 'rarityId',
      label: 'Raridade',
      chipLabel: 'Raridade',
      placeholder: 'Todas as raridades',
      icon: 'diamond',
      options: useRarityOptions(),
    },
    yearSelect(useAlbumYearOptions()),
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
      <CatalogFilterSelect select={statusSelect} value="" onChange={noop} />
    </CatalogFilters>
  );
}

function BulkDeletionDialog({ bulk, selection }: { bulk: BulkDeletion; selection: CardSelection }) {
  if (!bulk.isOpen) return null;

  return (
    <BulkDeleteCardsDialog
      cards={selection.selected}
      onClose={bulk.close}
      onDeleted={bulk.finish}
    />
  );
}

function selectionBarOf(bulk: BulkDeletion, selection: CardSelection) {
  return (
    <BulkSelectionBar
      count={selection.selected.length}
      onDelete={bulk.open}
      onClear={selection.clear}
    />
  );
}

export function CardsTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const cardsQuery = useCardsList(list.params);
  const dialogs = useCatalogItemDialogs<Card>(notify);
  const selection = useCardSelection();
  const bulk = useBulkDeletion(selection, notify);
  const rows = cardsQuery.data?.data ?? [];

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderCardForm(dialogs)} />
      <BulkDeletionDialog bulk={bulk} selection={selection} />
      <CardFilters list={list} summary={listSummary(cardsQuery.data?.meta.total, cardsFound)} />
      <CatalogListResult
        query={cardsQuery}
        table={cardsTableOf({ dialogs, selection, rows })}
        onPageChange={list.changePage}
        footer={selectionBarOf(bulk, selection)}
      />
    </div>
  );
}
