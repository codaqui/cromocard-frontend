import type { UseQueryResult } from '@tanstack/react-query';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { Select, type SelectOption } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import type { PaginatedResponse } from '@/types/api';
import { USER_ROLES, type UserRole } from '@/types/authenticated-user';

import { UsersTable } from '../../components/UsersTable/UsersTable';
import { useUsersListFilters } from '../../hooks/useUsersListFilters';
import { roleLabels, statusLabels } from '../../users.labels';
import { useUsersList } from '../../users.queries';
import { USER_STATUSES, type UserStatus, type UserSummary } from '../../users.types';
import styles from './UsersListPage.module.css';

const PAGE_SIZE = 20;

const roleOptions: SelectOption[] = USER_ROLES.map((role) => ({
  value: role,
  label: roleLabels[role],
}));

const statusOptions: SelectOption[] = USER_STATUSES.map((status) => ({
  value: status,
  label: statusLabels[status],
}));

type UsersListFilters = ReturnType<typeof useUsersListFilters>;

function SearchFilter({ search, changeSearch }: Pick<UsersListFilters, 'search' | 'changeSearch'>) {
  return (
    <TextField
      label="Buscar por nome ou e-mail"
      type="search"
      value={search}
      onChange={(event) => changeSearch(event.target.value)}
    />
  );
}

function RoleFilter({ role, changeRole }: Pick<UsersListFilters, 'role' | 'changeRole'>) {
  return (
    <Select
      label="Papel"
      placeholder="Todos"
      options={roleOptions}
      value={role}
      onChange={(event) => changeRole(event.target.value as UserRole | '')}
    />
  );
}

function StatusFilter({ status, changeStatus }: Pick<UsersListFilters, 'status' | 'changeStatus'>) {
  return (
    <Select
      label="Status"
      placeholder="Todos"
      options={statusOptions}
      value={status}
      onChange={(event) => changeStatus(event.target.value as UserStatus | '')}
    />
  );
}

function UsersListFilterFields(filters: UsersListFilters) {
  return (
    <div className={styles.filters}>
      <SearchFilter {...filters} />
      <RoleFilter {...filters} />
      <StatusFilter {...filters} />
    </div>
  );
}

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
  const filters = useUsersListFilters();
  const usersQuery = useUsersList({
    page: filters.page,
    pageSize: PAGE_SIZE,
    q: filters.debouncedSearch || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Usuários</h1>
      <UsersListFilterFields {...filters} />
      <UsersListResult query={usersQuery} onPageChange={filters.changePage} />
    </section>
  );
}
