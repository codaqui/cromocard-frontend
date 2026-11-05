import { categoryTypeLabels, EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { useCategoriesList } from '../../catalog.queries';
import type { Category } from '../../catalog.types';
import { useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CatalogFilters } from '../CatalogFilters/CatalogFilters';
import { CatalogListResult, type CatalogTable } from '../CatalogListResult/CatalogListResult';
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

export function CategoriesTab() {
  const list = useCatalogListFilters({});
  const categoriesQuery = useCategoriesList(list.params);

  return (
    <div className={styles.tab}>
      <CatalogFilters
        texts={categoryFiltersTexts}
        search={list.search}
        onSearchChange={list.changeSearch}
      />
      <CatalogListResult
        query={categoriesQuery}
        table={categoriesTable}
        onPageChange={list.changePage}
      />
    </div>
  );
}
