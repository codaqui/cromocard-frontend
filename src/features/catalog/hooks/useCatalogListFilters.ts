import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_DELAY_IN_MS = 400;

function filledFilters<TFilters extends Record<string, string>>(filters: TFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  ) as Partial<TFilters>;
}

function usePaging(pageSize: number) {
  const [paging, setPaging] = useState({ page: 1, pageSize });
  const page = paging.pageSize === pageSize ? paging.page : 1;
  const changePage = (next: number) =>
    setPaging((current) =>
      current.page === next && current.pageSize === pageSize ? current : { page: next, pageSize },
    );
  return { page, changePage };
}

function useFilterValues<TFilters extends Record<string, string>>(
  initialFilters: TFilters,
  onChange: () => void,
) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  return {
    search,
    filters,
    changeSearch: (value: string) => {
      setSearch(value);
      onChange();
    },
    changeFilter: (name: keyof TFilters, value: string) => {
      setFilters((current) => ({ ...current, [name]: value }));
      onChange();
    },
    clearAll: () => {
      setSearch('');
      setFilters(initialFilters);
      onChange();
    },
  };
}

export function useCatalogListFilters<TFilters extends Record<string, string>>(
  initialFilters: TFilters,
  pageSize: number,
) {
  const { page, changePage } = usePaging(pageSize);
  const values = useFilterValues(initialFilters, () => changePage(1));
  const debouncedSearch = useDebounce(values.search.trim(), SEARCH_DELAY_IN_MS);
  const params = { page, pageSize, q: debouncedSearch || undefined };

  return { ...values, params: { ...params, ...filledFilters(values.filters) }, changePage };
}

export type CatalogListFilters<TFilters extends Record<string, string>> = ReturnType<
  typeof useCatalogListFilters<TFilters>
>;
