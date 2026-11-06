import type { UseQueryResult } from '@tanstack/react-query';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import { Select, type SelectOption } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import { Toast } from '@/components/Toast/Toast';
import type { PaginatedResponse } from '@/types/api';
import { USER_ROLES, type UserRole } from '@/types/authenticated-user';

import { DeleteUserDialog } from '../../components/DeleteUserDialog/DeleteUserDialog';
import { SuspendUserDialog } from '../../components/SuspendUserDialog/SuspendUserDialog';
import { UserFormModal } from '../../components/UserFormModal/UserFormModal';
import { UsersTable } from '../../components/UsersTable/UsersTable';
import { useUserActionDialogs } from '../../hooks/useUserActionDialogs';
import { useUserFormModal } from '../../hooks/useUserFormModal';
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
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

function UsersListResult({ query, onPageChange, ...actions }: UsersListResultProps) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState message={query.error.message} />;
  if (query.data.data.length === 0) return <EmptyState title="Nenhum usuário encontrado" />;

  const { meta } = query.data;

  return (
    <>
      <UsersTable users={query.data.data} {...actions} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </>
  );
}

function UsersListHeader({ onNewUser }: { onNewUser: () => void }) {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Usuários</h1>
      <Button onClick={onNewUser}>Novo usuário</Button>
    </div>
  );
}

type FormModal = ReturnType<typeof useUserFormModal>;

function UserFormModalWithToast(formModal: FormModal) {
  return (
    <>
      <UserFormModal
        open={formModal.isOpen}
        user={formModal.editingUser}
        onClose={formModal.close}
        onSaved={formModal.saved}
      />
      <Toast message={formModal.toastMessage} onDismiss={formModal.dismissToast} />
    </>
  );
}

type ActionDialogs = ReturnType<typeof useUserActionDialogs>;

function UserActionDialogsWithToast(dialogs: ActionDialogs) {
  return (
    <>
      <SuspendUserDialog
        user={dialogs.suspendTarget}
        onClose={dialogs.close}
        onSaved={dialogs.savedSuspend}
      />
      <DeleteUserDialog
        user={dialogs.deleteTarget}
        onClose={dialogs.close}
        onSaved={dialogs.savedDelete}
      />
      <Toast message={dialogs.toastMessage} onDismiss={dialogs.dismissToast} />
    </>
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
  const filters = useUsersListFilters();
  const formModal = useUserFormModal();
  const actionDialogs = useUserActionDialogs();
  const usersQuery = useFilteredUsersList(filters);

  return (
    <section className={styles.page}>
      <UsersListHeader onNewUser={formModal.openCreate} />
      <UsersListFilterFields {...filters} />
      <UsersListResult
        query={usersQuery}
        onPageChange={filters.changePage}
        onEdit={formModal.openEdit}
        onToggleStatus={actionDialogs.openSuspend}
        onDelete={actionDialogs.openDelete}
      />
      <UserFormModalWithToast {...formModal} />
      <UserActionDialogsWithToast {...actionDialogs} />
    </section>
  );
}
