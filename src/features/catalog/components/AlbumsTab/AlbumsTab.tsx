import { EMPTY_VALUE } from '@/utils/emptyValue';
import { filtersStateOf, listSummary, selectChips } from '../../catalog.filter-chips';
import { useAlbumsList } from '../../catalog.queries';
import type { Album, CatalogTabProps } from '../../catalog.types';
import { useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import {
  AlbumStatusCell,
  CountCell,
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
import { AlbumFormModal } from '../AlbumFormModal/AlbumFormModal';
import styles from './AlbumsTab.module.css';

const albumsTable: CatalogTable<Album> = {
  caption: 'Álbuns do catálogo',
  emptyTitle: 'Nenhum álbum encontrado',
  columns: [
    {
      key: 'cover',
      header: 'Capa',
      render: (album) => <Thumbnail imageUrl={album.coverUrl} />,
    },
    {
      key: 'title',
      header: 'Título e editora',
      render: (album) => <TitleCell title={album.title} detail={album.publisher} />,
    },
    {
      key: 'year',
      header: 'Ano',
      render: (album) => album.year ?? EMPTY_VALUE,
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
    {
      key: 'status',
      header: 'Status',
      render: (album) => <AlbumStatusCell status={album.status} />,
    },
  ],
};

const albumFiltersTexts = {
  label: 'Filtros dos álbuns',
  searchLabel: 'Buscar álbum pelo título',
  searchPlaceholder: 'Buscar por título…',
};

const initialFilters = { categoryId: '' };

type AlbumFilters = typeof initialFilters;

const albumsFound = { one: 'álbum encontrado', many: 'álbuns encontrados' };

function albumsTableWith(dialogs: CatalogItemDialogs<Album>): CatalogTable<Album> {
  const actions = catalogActionsColumn<Album>('album', (album) => album.title, dialogs);
  return { ...albumsTable, columns: [...albumsTable.columns, actions] };
}

function renderAlbumForm(dialogs: CatalogItemDialogs<Album>) {
  return (album?: Album) => (
    <AlbumFormModal album={album} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

function useFranchiseSelect(): CatalogFilterSelectConfig<'categoryId'> {
  return {
    name: 'categoryId',
    label: 'Franquia',
    chipLabel: 'Franquia',
    placeholder: 'Todas as franquias',
    icon: 'gamepad',
    options: useCategoryOptions(),
  };
}

interface AlbumFiltersProps {
  list: CatalogListFilters<AlbumFilters>;
  summary?: string;
}

function AlbumFilters({ list, summary }: AlbumFiltersProps) {
  const franchise = useFranchiseSelect();
  const onRemove = () => list.changeFilter('categoryId', '');
  const chips = selectChips({ selects: [franchise], values: list.filters, onRemove });
  const state = filtersStateOf(list, chips, summary);

  return (
    <CatalogFilters texts={albumFiltersTexts} state={state}>
      <CatalogFilterSelect
        select={franchise}
        value={list.filters.categoryId}
        onChange={list.changeFilter}
      />
    </CatalogFilters>
  );
}

export function AlbumsTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const albumsQuery = useAlbumsList(list.params);
  const dialogs = useCatalogItemDialogs<Album>(notify);

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderAlbumForm(dialogs)} />
      <AlbumFilters list={list} summary={listSummary(albumsQuery.data?.meta.total, albumsFound)} />
      <CatalogListResult
        query={albumsQuery}
        table={albumsTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
