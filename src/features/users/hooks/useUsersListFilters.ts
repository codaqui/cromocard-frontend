import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import type { UserRole } from '@/types/authenticated-user';

import type { UserStatus } from '../users.types';

const SEARCH_DELAY_IN_MS = 400;

function withPageReset<T>(setValue: (value: T) => void, setPage: (page: number) => void) {
  return (value: T) => {
    setValue(value);
    setPage(1);
  };
}

export function useUsersListFilters() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), SEARCH_DELAY_IN_MS);

  return {
    search,
    role,
    status,
    page,
    debouncedSearch,
    changeSearch: withPageReset(setSearch, setPage),
    changeRole: withPageReset(setRole, setPage),
    changeStatus: withPageReset(setStatus, setPage),
    changePage: setPage,
    hasFilters: Boolean(search || role || status),
    clearFilters: () => {
      setSearch('');
      setRole('');
      setStatus('');
      setPage(1);
    },
  };
}
