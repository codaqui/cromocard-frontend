import { EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { filtersStateOf, listSummary, selectChips } from '../../catalog.filter-chips';
import { formatEdition } from '../../catalog.format';
import { useAlbumsList } from '../../catalog.queries';
import type { Album, CatalogTabProps } from '../../catalog.types';
import { useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CountCell, FranchiseBadge, Thumbnail, TitleCell } from '../CatalogCells/CatalogCells';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import {
  CatalogFilterSelect,
  type CatalogFilterSelectConfig,
} from '../CatalogFilterSelect/CatalogFilterSelect';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { CatalogSearchField } from '../CatalogSearchField/CatalogSearchField';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { AlbumFormModal } from '../AlbumFormModal/AlbumFormModal';
import styles from './AlbumsTab.module.css';

const albumsTable: CatalogTable<Album> = {
  caption: 'Álbuns do catálogo',
  emptyTitle: 'Nenhum álbum encontrado',
  columns: [
    {
      key: 'cover',
      header: 'Álbum & capa',
      render: (album) => <Thumbnail imageUrl={album.coverUrl} />,
    },
    {
      key: 'title',
      header: 'Título oficial',
      render: (album) => <TitleCell title={album.title} />,
    },
    {
      key: 'edition',
      header: 'Editora & ano',
      render: (album) => formatEdition(album) ?? EMPTY_VALUE_LABEL,
    },
    {
      key: 'category',
      header: 'Franquia',
      render: (album) => <FranchiseBadge name={album.category?.name} />,
    },
    {
      key: 'totalCards',
      header: 'Cartas',
      render: (album) => <CountCell value={album.totalCards} />,
    },
  ],
};

const albumFiltersTexts = {
  label: 'Filtros dos álbuns',
  searchLabel: 'Buscar álbum pelo título',
  searchPlaceholder: 'Buscar por título do álbum…',
};

const initialFilters = { categoryId: '', year: '' };

type AlbumFilters = typeof initialFilters;

function albumsTableWith(dialogs: CatalogItemDialogs<Album>): CatalogTable<Album> {
  const actions = catalogActionsColumn<Album>('album', (album) => album.title, dialogs);
  return { ...albumsTable, columns: [...albumsTable.columns, actions] };
}

function renderAlbumForm(dialogs: CatalogItemDialogs<Album>) {
  return (album?: Album) => (
    <AlbumFormModal album={album} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

function yearFilterOf(value: string): number | undefined {
  const year = Number(value);
  return Number.isInteger(year) && year > 0 ? year : undefined;
}

function useFranchiseSelect(): CatalogFilterSelectConfig<'categoryId'> {
  return {
    name: 'categoryId',
    label: 'Franquia',
    chipLabel: 'Franquia',
    placeholder: 'Todas as Franquias',
    icon: 'gamepad',
    options: useCategoryOptions('ALBUM'),
  };
}

function yearChip(list: CatalogListFilters<AlbumFilters>) {
  const { year } = list.filters;
  return year
    ? [{ key: 'year', label: `Ano: ${year}`, onRemove: () => list.changeFilter('year', '') }]
    : [];
}

function albumChips(
  list: CatalogListFilters<AlbumFilters>,
  franchise: CatalogFilterSelectConfig<'categoryId'>,
) {
  const onRemove = () => list.changeFilter('categoryId', '');
  return [
    ...selectChips({ selects: [franchise], values: list.filters, onRemove }),
    ...yearChip(list),
  ];
}

interface AlbumFiltersProps {
  list: CatalogListFilters<AlbumFilters>;
  summary?: string;
}

function AlbumFilters({ list, summary }: AlbumFiltersProps) {
  const franchise = useFranchiseSelect();
  const state = filtersStateOf(list, albumChips(list, franchise), summary);

  return (
    <CatalogFilters texts={albumFiltersTexts} state={state}>
      <CatalogFilterSelect
        select={franchise}
        value={list.filters.categoryId}
        onChange={list.changeFilter}
      />
      <CatalogSearchField
        label="Ano"
        placeholder="Edição / Ano"
        icon="calendar"
        numeric
        value={list.filters.year}
        onChange={(value) => list.changeFilter('year', value)}
      />
    </CatalogFilters>
  );
}

export function AlbumsTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const albumsQuery = useAlbumsList({ ...list.params, year: yearFilterOf(list.filters.year) });
  const dialogs = useCatalogItemDialogs<Album>(notify);
  const result = albumsQuery.data;

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderAlbumForm(dialogs)} />
      <AlbumFilters
        list={list}
        summary={listSummary(result?.data.length, result?.meta.total, 'álbuns')}
      />
      <CatalogListResult
        query={albumsQuery}
        table={albumsTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
