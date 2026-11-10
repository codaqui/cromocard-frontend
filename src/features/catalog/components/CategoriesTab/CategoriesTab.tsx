import { Button } from '@/components/Button/Button';

import { categoryTypeLabels, EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { filtersStateOf, listSummary } from '../../catalog.filter-chips';
import { useCategoriesList } from '../../catalog.queries';
import type { Category, CatalogTabProps } from '../../catalog.types';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { FranchiseBadge, TitleCell } from '../CatalogCells/CatalogCells';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
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
      header: 'Categoria / franquia',
      render: (category) => <TitleCell title={category.name} />,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (category) => <FranchiseBadge name={categoryTypeLabels[category.type]} />,
    },
    {
      key: 'parent',
      header: 'Categoria pai',
      render: (category) => category.parentCategory?.name ?? EMPTY_VALUE_LABEL,
    },
  ],
};

const categoryFiltersTexts = {
  label: 'Filtros das categorias',
  searchLabel: 'Buscar categoria pelo nome',
  searchPlaceholder: 'Buscar por nome da categoria ou franquia…',
};

const NO_FILTERS = {};

function categoriesTableWith(dialogs: CatalogItemDialogs<Category>): CatalogTable<Category> {
  const actions = catalogActionsColumn<Category>('category', (category) => category.name, dialogs);
  return { ...categoriesTable, columns: [...categoriesTable.columns, actions] };
}

function renderCategoryForm(dialogs: CatalogItemDialogs<Category>) {
  return (category?: Category) => (
    <CategoryFormModal category={category} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

export function CategoriesTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(NO_FILTERS, pageSize);
  const categoriesQuery = useCategoriesList(list.params);
  const dialogs = useCatalogItemDialogs<Category>(notify);
  const result = categoriesQuery.data;
  const summary = listSummary(result?.data.length, result?.meta.total, 'categorias');
  const state = filtersStateOf(list, [], summary);

  return (
    <div className={styles.tab}>
      <CatalogDialogs dialogs={dialogs} renderForm={renderCategoryForm(dialogs)} />
      <CatalogFilters texts={categoryFiltersTexts} state={state}>
        <Button className={styles.create} onClick={dialogs.openCreate}>
          <CatalogIcon name="category" />+ Nova Categoria
        </Button>
      </CatalogFilters>
      <CatalogListResult
        query={categoriesQuery}
        table={categoriesTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
