import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

import type { GroupStatus, ListGroupsParams } from '../community-admin.types';

const SEARCH_DELAY_IN_MS = 400;
const GROUPS_PAGE_SIZE = 10;

export interface GroupsFilters {
  search: string;
  status: GroupStatus | '';
  params: ListGroupsParams;
  changeSearch: (value: string) => void;
  changeStatus: (value: GroupStatus | '') => void;
  changePage: (page: number) => void;
}

function withPageReset(setPage: (page: number) => void) {
  return <T>(update: (value: T) => void) =>
    (value: T) => {
      update(value);
      setPage(1);
    };
}

export function useGroupsFilters(): GroupsFilters {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<GroupStatus | ''>('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), SEARCH_DELAY_IN_MS);
  const resetPage = withPageReset(setPage);

  return {
    search,
    status,
    params: { q: q || undefined, status: status || undefined, page, pageSize: GROUPS_PAGE_SIZE },
    changeSearch: resetPage(setSearch),
    changeStatus: resetPage(setStatus),
    changePage: setPage,
  };
}
