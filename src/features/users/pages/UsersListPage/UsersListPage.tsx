import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { Select, type SelectOption } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import { userDetailPathFor } from '@/routes/paths';
import type { PaginatedResponse } from '@/types/api';
import type { UserRole } from '@/types/authenticated-user';

import { UserActionDialogsWithToast } from '../../components/UserActionDialogsWithToast/UserActionDialogsWithToast';
import { UserFormModalWithToast } from '../../components/UserFormModalWithToast/UserFormModalWithToast';
import { UsersTable } from '../../components/UsersTable/UsersTable';
import { useUserActionDialogs } from '../../hooks/useUserActionDialogs';
import { useUserFormModal } from '../../hooks/useUserFormModal';
import { useUsersListFilters } from '../../hooks/useUsersListFilters';
import { roleSelectOptions, statusLabels } from '../../users.labels';
import { useUsersList } from '../../users.queries';
import { USER_STATUSES, type UserStatus, type UserSummary } from '../../users.types';
import styles from './UsersListPage.module.css';

const PAGE_SIZE = 20;

const statusOptions: SelectOption[] = USER_STATUSES.map((status) => ({
  value: status,
  label: statusLabels[status],
}));

type UsersListFilters = ReturnType<typeof useUsersListFilters>;

function SearchFilter({ search, changeSearch }: Pick<UsersListFilters, 'search' | 'changeSearch'>) {
  return (
    <TextField
      label="Buscar por nome, @, e-mail, CPF ou ID"
      icon="search"
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
      icon="shield"
      placeholder="Todos"
      options={roleSelectOptions}
      value={role}
      onChange={(event) => changeRole(event.target.value as UserRole | '')}
    />
  );
}

function StatusFilter({ status, changeStatus }: Pick<UsersListFilters, 'status' | 'changeStatus'>) {
  return (
    <Select
      label="Status"
      icon="checkCircle"
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
  onView: (user: UserSummary) => void;
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

function TableHeading({ count }: { count: number }) {
  return (
    <div className={styles.tableHeading}>
      <span>
        Mesa de usuários registrados
        <span className={styles.countPill}>{count} registros carregados</span>
      </span>
      <span className={styles.inspectHint}>Clique na linha para inspecionar</span>
    </div>
  );
}

function UsersListResult({ query, onPageChange, ...actions }: UsersListResultProps) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (query.data.data.length === 0) return <EmptyState title="Nenhum usuário encontrado" />;

  const { meta } = query.data;

  return (
    <>
      <TableHeading count={query.data.data.length} />
      <UsersTable users={query.data.data} {...actions} />
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}

interface UsersListHeaderProps {
  total: number | undefined;
  onNewUser: () => void;
}

function UsersListHeader({ total, onNewUser }: UsersListHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>BackOffice · Administração</p>
        <h1 className={styles.title}>Usuários</h1>
        <p className={styles.subtitle}>
          Crie, edite, suspenda, reative e exclua contas de usuários da plataforma.
        </p>
      </div>
      <div className={styles.headerActions}>
        {total !== undefined && (
          <span className={styles.totalBadge}>
            <Icon name="shield" size={16} />
            Total: {total}
          </span>
        )}
        <Button onClick={onNewUser}>+ Novo Usuário no Sistema</Button>
      </div>
    </div>
  );
}

function useFilteredUsersList(filters: UsersListFilters) {
  return useUsersList({
    page: filters.page,
    pageSize: PAGE_SIZE,
    q: filters.debouncedSearch || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });
}

export function UsersListPage() {
  const navigate = useNavigate();
  const filters = useUsersListFilters();
  const formModal = useUserFormModal();
  const actionDialogs = useUserActionDialogs();
  const usersQuery = useFilteredUsersList(filters);

  return (
    <section className={styles.page}>
      <UsersListHeader total={usersQuery.data?.meta.total} onNewUser={formModal.openCreate} />
      <UsersListFilterFields {...filters} />
      <UsersListResult
        query={usersQuery}
        onPageChange={filters.changePage}
        onView={(user) => void navigate(userDetailPathFor(user.id))}
        onEdit={formModal.openEdit}
        onToggleStatus={actionDialogs.openSuspend}
        onDelete={actionDialogs.openDelete}
      />
      <UserFormModalWithToast formModal={formModal} />
      <UserActionDialogsWithToast dialogs={actionDialogs} />
    </section>
  );
}
