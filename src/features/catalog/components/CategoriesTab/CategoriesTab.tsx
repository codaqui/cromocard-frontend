import { EMPTY_VALUE } from '@/utils/emptyValue';

import { categoryBadgeLabels } from '../../catalog.labels';
import { filtersStateOf, listSummary } from '../../catalog.filter-chips';
import { useCategoriesList } from '../../catalog.queries';
import type { CatalogTabProps, Category } from '../../catalog.types';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CountCell, TitleCell } from '../CatalogCells/CatalogCells';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { CategoryFormModal } from '../CategoryFormModal/CategoryFormModal';
import styles from './CategoriesTab.module.css';

const categoriesTable: CatalogTable<Category> = {
  caption: 'Categorias e franquias do catálogo',
  emptyTitle: 'Nenhuma categoria encontrada',
  columns: [
    {
      key: 'name',
      header: 'Nome e slug',
      render: (category) => (
        <TitleCell
          title={category.name}
          detail={category.slug}
          badge={category.badge && categoryBadgeLabels[category.badge]}
        />
      ),
    },
    {
      key: 'parent',
      header: 'Categoria pai',
      render: (category) => category.parentCategory?.name ?? EMPTY_VALUE,
    },
    {
      key: 'cardsCount',
      header: 'Cartas',
      render: (category) => <CountCell value={category.cardsCount} />,
    },
  ],
};

const categoryFiltersTexts = {
  label: 'Filtros das categorias',
  searchLabel: 'Buscar categoria pelo nome ou slug',
  searchPlaceholder: 'Buscar por nome ou slug…',
};

const initialFilters: Record<string, string> = {};

type CategoryFilters = typeof initialFilters;

const categoriesFound = { one: 'categoria', many: 'categorias' };

function categoriesTableWith(dialogs: CatalogItemDialogs<Category>): CatalogTable<Category> {
  const actions = catalogActionsColumn<Category>('category', (category) => category.name, dialogs);
  return { ...categoriesTable, columns: [...categoriesTable.columns, actions] };
}

function renderCategoryForm(dialogs: CatalogItemDialogs<Category>) {
  return (category?: Category) => (
    <CategoryFormModal category={category} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

interface CategoryFiltersProps {
  list: CatalogListFilters<CategoryFilters>;
  summary?: string;
}

function CategoryFilters({ list, summary }: CategoryFiltersProps) {
  return <CatalogFilters texts={categoryFiltersTexts} state={filtersStateOf(list, [], summary)} />;
}

export function CategoriesTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const categoriesQuery = useCategoriesList(list.params);
  const dialogs = useCatalogItemDialogs<Category>(notify);
  const summary = listSummary(categoriesQuery.data?.meta.total, categoriesFound);

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderCategoryForm(dialogs)} />
      <CategoryFilters list={list} summary={summary} />
      <CatalogListResult
        query={categoriesQuery}
        table={categoriesTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
