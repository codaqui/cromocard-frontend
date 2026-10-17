import type { UseQueryResult } from '@tanstack/react-query';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { TextField } from '@/components/TextField/TextField';
import type { PaginatedResponse } from '@/types/api';

import { UsersTable } from '../../components/UsersTable/UsersTable';
import { useUsersListFilters } from '../../hooks/useUsersListFilters';
import { useUsersList } from '../../users.queries';
import type { UserSummary } from '../../users.types';
import styles from './UsersListPage.module.css';

const PAGE_SIZE = 20;

interface UsersListResultProps {
  query: UseQueryResult<PaginatedResponse<UserSummary>>;
  onPageChange: (page: number) => void;
}

function UsersListResult({ query, onPageChange }: UsersListResultProps) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (query.data.data.length === 0) return <EmptyState title="Nenhum usuário encontrado" />;

  const { meta } = query.data;

  return (
    <>
      <UsersTable users={query.data.data} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </>
  );
}

export function UsersListPage() {
  const { search, page, debouncedSearch, changeSearch, changePage } = useUsersListFilters();
  const usersQuery = useUsersList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Usuários</h1>
      <TextField
        label="Buscar por nome ou e-mail"
        type="search"
        value={search}
        onChange={(event) => changeSearch(event.target.value)}
      />
      <UsersListResult query={usersQuery} onPageChange={changePage} />
    </section>
  );
}
