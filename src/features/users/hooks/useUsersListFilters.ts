import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_DELAY_IN_MS = 400;

export function useUsersListFilters() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DELAY_IN_MS);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return { search, page, debouncedSearch, changeSearch, changePage: setPage };
}
