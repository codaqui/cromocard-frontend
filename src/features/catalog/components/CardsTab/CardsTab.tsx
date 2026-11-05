import { EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { useCardsList } from '../../catalog.queries';
import type { Card } from '../../catalog.types';
import {
  useAlbumOptions,
  useCategoryOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import {
  type CatalogFilterSelect,
  CatalogFilterSelects,
} from '../CatalogFilterSelects/CatalogFilterSelects';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import styles from './CardsTab.module.css';

const cardsTable: CatalogTable<Card> = {
  caption: 'Cartas do catálogo',
  emptyTitle: 'Nenhuma carta encontrada',
  columns: [
    {
      key: 'image',
      header: 'Imagem',
      render: (card) => <img className={styles.thumbnail} src={card.frontImageUrl} alt="" />,
    },
    { key: 'number', header: 'Nº', render: (card) => card.number ?? EMPTY_VALUE_LABEL },
    { key: 'name', header: 'Nome', render: (card) => card.name },
    { key: 'album', header: 'Álbum', render: (card) => card.album?.title ?? EMPTY_VALUE_LABEL },
    {
      key: 'category',
      header: 'Categoria',
      render: (card) => card.category?.name ?? EMPTY_VALUE_LABEL,
    },
    { key: 'rarity', header: 'Raridade', render: (card) => card.rarity?.name ?? EMPTY_VALUE_LABEL },
    {
      key: 'language',
      header: 'Idioma',
      render: (card) => card.language?.name ?? EMPTY_VALUE_LABEL,
    },
  ],
};

const cardFiltersTexts = { label: 'Filtros das cartas', searchLabel: 'Buscar carta pelo nome' };

const initialFilters = { albumId: '', categoryId: '', rarityId: '' };

type CardFilterName = keyof typeof initialFilters;

function useCardFilterSelects(): CatalogFilterSelect<CardFilterName>[] {
  return [
    { name: 'albumId', label: 'Álbum', placeholder: 'Todos os álbuns', options: useAlbumOptions() },
    {
      name: 'categoryId',
      label: 'Categoria',
      placeholder: 'Todas as categorias',
      options: useCategoryOptions('CARD'),
    },
    {
      name: 'rarityId',
      label: 'Raridade',
      placeholder: 'Todas as raridades',
      options: useRarityOptions(),
    },
  ];
}

export function CardsTab() {
  const list = useCatalogListFilters(initialFilters);
  const selects = useCardFilterSelects();
  const cardsQuery = useCardsList(list.params);

  return (
    <div className={styles.tab}>
      <CatalogFilters
        texts={cardFiltersTexts}
        search={list.search}
        onSearchChange={list.changeSearch}
      >
        <CatalogFilterSelects
          selects={selects}
          values={list.filters}
          onChange={list.changeFilter}
        />
      </CatalogFilters>
      <CatalogListResult query={cardsQuery} table={cardsTable} onPageChange={list.changePage} />
    </div>
  );
}
