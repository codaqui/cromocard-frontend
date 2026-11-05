import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_DELAY_IN_MS = 400;
const PAGE_SIZE = 20;

function filledFilters<TFilters extends Record<string, string>>(filters: TFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== ''),
  ) as Partial<TFilters>;
}

export function useCatalogListFilters<TFilters extends Record<string, string>>(
  initialFilters: TFilters,
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DELAY_IN_MS);
  const params = { page, pageSize: PAGE_SIZE, q: debouncedSearch || undefined };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changeFilter = (name: keyof TFilters, value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  return {
    search,
    filters,
    params: { ...params, ...filledFilters(filters) },
    changeSearch,
    changeFilter,
    changePage: setPage,
  };
}
