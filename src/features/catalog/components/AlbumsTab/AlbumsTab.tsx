import { TextField } from '@/components/TextField/TextField';

import { EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { useAlbumsList } from '../../catalog.queries';
import type { Album } from '../../catalog.types';
import { useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CatalogFilterSelects } from '../CatalogFilterSelects/CatalogFilterSelects';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { AlbumFormModal } from '../AlbumFormModal/AlbumFormModal';
import styles from './AlbumsTab.module.css';

const albumsTable: CatalogTable<Album> = {
  caption: 'Álbuns do catálogo',
  emptyTitle: 'Nenhum álbum encontrado',
  columns: [
    { key: 'title', header: 'Título', render: (album) => album.title },
    {
      key: 'publisher',
      header: 'Editora',
      render: (album) => album.publisher ?? EMPTY_VALUE_LABEL,
    },
    { key: 'year', header: 'Ano', render: (album) => album.year ?? EMPTY_VALUE_LABEL },
    {
      key: 'category',
      header: 'Categoria',
      render: (album) => album.category?.name ?? EMPTY_VALUE_LABEL,
    },
    { key: 'totalCards', header: 'Cartas', render: (album) => album.totalCards },
  ],
};

const albumFiltersTexts = { label: 'Filtros dos álbuns', searchLabel: 'Buscar álbum pelo título' };

const initialFilters = { categoryId: '', year: '' };

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

type AlbumFilterValues = typeof initialFilters;

const categorySelect = {
  name: 'categoryId',
  label: 'Categoria',
  placeholder: 'Todas as categorias',
} as const;

interface AlbumFiltersProps {
  search: string;
  filters: AlbumFilterValues;
  onSearchChange: (value: string) => void;
  onFilterChange: (name: keyof AlbumFilterValues, value: string) => void;
}

function AlbumFilters({ search, filters, onSearchChange, onFilterChange }: AlbumFiltersProps) {
  const categoryOptions = useCategoryOptions('ALBUM');

  return (
    <CatalogFilters texts={albumFiltersTexts} search={search} onSearchChange={onSearchChange}>
      <CatalogFilterSelects
        selects={[{ ...categorySelect, options: categoryOptions }]}
        values={filters}
        onChange={onFilterChange}
      />
      <TextField
        label="Ano"
        type="number"
        inputMode="numeric"
        min={1}
        value={filters.year}
        onChange={(event) => onFilterChange('year', event.target.value)}
      />
    </CatalogFilters>
  );
}

export function AlbumsTab() {
  const list = useCatalogListFilters(initialFilters);
  const albumsQuery = useAlbumsList({ ...list.params, year: yearFilterOf(list.filters.year) });
  const dialogs = useCatalogItemDialogs<Album>();

  return (
    <div className={styles.tab}>
      <CatalogDialogs
        createLabel="+ Novo Álbum"
        dialogs={dialogs}
        renderForm={renderAlbumForm(dialogs)}
      />
      <AlbumFilters
        search={list.search}
        filters={list.filters}
        onSearchChange={list.changeSearch}
        onFilterChange={list.changeFilter}
      />
      <CatalogListResult
        query={albumsQuery}
        table={albumsTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
