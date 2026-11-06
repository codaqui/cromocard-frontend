import { useState } from 'react';

import { Button } from '@/components/Button/Button';

import { EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { useCardsList } from '../../catalog.queries';
import type { Card } from '../../catalog.types';
import {
  useAlbumOptions,
  useCategoryOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import {
  type CatalogFilterSelect,
  CatalogFilterSelects,
} from '../CatalogFilterSelects/CatalogFilterSelects';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { CardFormModal } from '../CardFormModal/CardFormModal';
import { ImportCsvModal } from '../ImportCsvModal/ImportCsvModal';
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

function cardsTableWith(dialogs: CatalogItemDialogs<Card>): CatalogTable<Card> {
  const actions = catalogActionsColumn<Card>('card', (card) => card.name, dialogs);
  return { ...cardsTable, columns: [...cardsTable.columns, actions] };
}

function renderCardForm(dialogs: CatalogItemDialogs<Card>) {
  return (card?: Card) => (
    <CardFormModal card={card} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

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

function CardFilters({ list }: { list: CatalogListFilters<typeof initialFilters> }) {
  const selects = useCardFilterSelects();

  return (
    <CatalogFilters
      texts={cardFiltersTexts}
      search={list.search}
      onSearchChange={list.changeSearch}
    >
      <CatalogFilterSelects selects={selects} values={list.filters} onChange={list.changeFilter} />
    </CatalogFilters>
  );
}

function CardImport({ onImported }: { onImported: (message: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const finish = (message: string) => {
    setIsOpen(false);
    onImported(message);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Importar CSV
      </Button>
      {isOpen && <ImportCsvModal onClose={() => setIsOpen(false)} onImported={finish} />}
    </>
  );
}

export function CardsTab() {
  const list = useCatalogListFilters(initialFilters);
  const cardsQuery = useCardsList(list.params);
  const dialogs = useCatalogItemDialogs<Card>();

  return (
    <div className={styles.tab}>
      <CatalogDialogs
        createLabel="+ Cadastrar Carta"
        dialogs={dialogs}
        renderForm={renderCardForm(dialogs)}
        actions={<CardImport onImported={dialogs.finish} />}
      />
      <CardFilters list={list} />
      <CatalogListResult
        query={cardsQuery}
        table={cardsTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
