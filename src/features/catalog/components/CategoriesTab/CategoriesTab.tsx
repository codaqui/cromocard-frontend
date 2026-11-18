import { categoryBadgeLabels, categoryTypeLabels, EMPTY_VALUE_LABEL } from '../../catalog.labels';
import { filtersStateOf, listSummary, selectChips } from '../../catalog.filter-chips';
import { useCategoriesList } from '../../catalog.queries';
import {
  CATEGORY_TYPES,
  type Category,
  type CatalogTabProps,
  type CategoryType,
} from '../../catalog.types';
import { type CatalogItemDialogs, useCatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { type CatalogListFilters, useCatalogListFilters } from '../../hooks/useCatalogListFilters';
import { CountCell, FranchiseBadge, TitleCell } from '../CatalogCells/CatalogCells';
import { CatalogDialogs } from '../CatalogDialogs/CatalogDialogs';
import {
  CatalogFilterSelect,
  type CatalogFilterSelectConfig,
} from '../CatalogFilterSelect/CatalogFilterSelect';
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
      render: (category) => category.parentCategory?.name ?? EMPTY_VALUE_LABEL,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (category) => <FranchiseBadge name={categoryTypeLabels[category.type]} />,
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

const initialFilters = { type: '' };

type CategoryFilters = typeof initialFilters;

const categoriesFound = { one: 'categoria', many: 'categorias' };

const typeSelect: CatalogFilterSelectConfig<'type'> = {
  name: 'type',
  label: 'Tipo',
  chipLabel: 'Tipo',
  placeholder: 'Todos os tipos',
  icon: 'gamepad',
  options: CATEGORY_TYPES.map((type) => ({ value: type, label: categoryTypeLabels[type] })),
};

function categoryTypeOf(value: string): CategoryType | undefined {
  return CATEGORY_TYPES.find((type) => type === value);
}

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
  const onRemove = () => list.changeFilter('type', '');
  const chips = selectChips({ selects: [typeSelect], values: list.filters, onRemove });

  return (
    <CatalogFilters texts={categoryFiltersTexts} state={filtersStateOf(list, chips, summary)}>
      <CatalogFilterSelect
        select={typeSelect}
        value={list.filters.type}
        onChange={list.changeFilter}
      />
    </CatalogFilters>
  );
}

export function CategoriesTab({ pageSize, notify }: CatalogTabProps) {
  const list = useCatalogListFilters(initialFilters, pageSize);
  const categoriesQuery = useCategoriesList({
    ...list.params,
    type: categoryTypeOf(list.filters.type),
  });
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
