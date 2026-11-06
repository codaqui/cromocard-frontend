import { categoryTypeLabels, EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { useCategoriesList } from '../../catalog.queries';
import type { Category } from '../../catalog.types';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import { catalogActionsColumn } from '../CatalogRowActions/catalogActionsColumn';
import { CategoryFormModal } from '../CategoryFormModal/CategoryFormModal';
import styles from './CategoriesTab.module.css';

const categoriesTable: CatalogTable<Category> = {
  caption: 'Categorias e franquias do catálogo',
  emptyTitle: 'Nenhuma categoria encontrada',
  columns: [
    { key: 'name', header: 'Nome', render: (category) => category.name },
    { key: 'type', header: 'Tipo', render: (category) => categoryTypeLabels[category.type] },
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
};

function categoriesTableWith(dialogs: CatalogItemDialogs<Category>): CatalogTable<Category> {
  const actions = catalogActionsColumn<Category>('category', (category) => category.name, dialogs);
  return { ...categoriesTable, columns: [...categoriesTable.columns, actions] };
}

function renderCategoryForm(dialogs: CatalogItemDialogs<Category>) {
  return (category?: Category) => (
    <CategoryFormModal category={category} onClose={dialogs.close} onSaved={dialogs.finish} />
  );
}

export function CategoriesTab() {
  const list = useCatalogListFilters({});
  const categoriesQuery = useCategoriesList(list.params);
  const dialogs = useCatalogItemDialogs<Category>();

  return (
    <div className={styles.tab}>
      <CatalogDialogs
        createLabel="+ Nova Categoria"
        dialogs={dialogs}
        renderForm={renderCategoryForm(dialogs)}
      />
      <CatalogFilters
        texts={categoryFiltersTexts}
        search={list.search}
        onSearchChange={list.changeSearch}
      />
      <CatalogListResult
        query={categoriesQuery}
        table={categoriesTableWith(dialogs)}
        onPageChange={list.changePage}
      />
    </div>
  );
}
