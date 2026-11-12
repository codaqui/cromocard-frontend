import type { FilterChip } from './components/ActiveFilters/ActiveFilters';
import type { CatalogFilterSelectConfig } from './components/CatalogFilterSelect/CatalogFilterSelect';

interface ChipSource<TName extends string> {
  selects: CatalogFilterSelectConfig<TName>[];
  values: Record<TName, string>;
  onRemove: (name: TName) => void;
}

function optionLabel<TName extends string>(
  select: CatalogFilterSelectConfig<TName>,
  value: string,
) {
  return select.options.find((option) => option.value === value)?.label ?? value;
}

export function selectChips<TName extends string>({
  selects,
  values,
  onRemove,
}: ChipSource<TName>): FilterChip[] {
  return selects
    .filter((select) => values[select.name] !== '')
    .map((select) => ({
      key: select.name,
      label: `${select.chipLabel}: ${optionLabel(select, values[select.name])}`,
      onRemove: () => onRemove(select.name),
    }));
}

export function searchChip(search: string, onRemove: () => void): FilterChip[] {
  const term = search.trim();
  return term ? [{ key: 'search', label: `Busca: ${term}`, onRemove }] : [];
}

interface SearchableList {
  search: string;
  changeSearch: (value: string) => void;
  clearAll: () => void;
}

export function filtersStateOf(list: SearchableList, chips: FilterChip[], summary?: string) {
  return {
    search: list.search,
    chips: [...searchChip(list.search, () => list.changeSearch('')), ...chips],
    summary,
    onSearchChange: list.changeSearch,
    onClearAll: list.clearAll,
  };
}

export function listSummary(shown: number | undefined, total: number | undefined, noun: string) {
  if (shown === undefined || total === undefined) return undefined;
  return `Exibindo ${shown} de ${total} ${noun}`;
}
