import type { MouseEventHandler } from 'react';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import type { UserRole } from '@/types/authenticated-user';
import { formatDate } from '@/utils/formatDate';

import {
  roleLabels,
  roleTones,
  statusLabels,
  statusTones,
  toggleStatusCopyFor,
} from '../../users.labels';
import { initialsOf, shortIdOf } from '../../users.format';
import type { UserStatus, UserSummary } from '../../users.types';
import styles from './UsersTable.module.css';

interface UsersTableProps {
  users: UserSummary[];
  onView: (user: UserSummary) => void;
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

interface RowActionsProps {
  user: UserSummary;
  onView: (user: UserSummary) => void;
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={roleTones[role]}>{roleLabels[role]}</Badge>;
}

function NameCell({ user }: { user: UserSummary }) {
  return (
    <div className={styles.nameCell}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(user.name)}
      </span>
      <div>
        <div>{user.name}</div>
        <div className={styles.userId}>{shortIdOf(user.id)}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={styles.status} data-tone={statusTones[status]}>
      <span className={styles.statusDot} aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}

interface ActionIconButtonProps {
  label: string;
  icon: IconName;
  variant: 'secondary' | 'danger';
  onClick: () => void;
}

function ActionIconButton({ label, icon, variant, onClick }: ActionIconButtonProps) {
  const handleClick: MouseEventHandler = (event) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Button
      variant={variant}
      className={styles.iconButton}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <Icon name={icon} size={16} />
    </Button>
  );
}

function rowActionsFor({
  user,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: RowActionsProps): ActionIconButtonProps[] {
  const toggleStatus = toggleStatusCopyFor(user.status);

  return [
    { label: 'Visualizar', icon: 'visibility', variant: 'secondary', onClick: () => onView(user) },
    { label: 'Editar', icon: 'edit', variant: 'secondary', onClick: () => onEdit(user) },
    { ...toggleStatus, variant: 'secondary', onClick: () => onToggleStatus(user) },
    { label: 'Excluir', icon: 'delete', variant: 'danger', onClick: () => onDelete(user) },
  ];
}

function RowActions(props: RowActionsProps) {
  return (
    <div className={styles.actions}>
      {rowActionsFor(props).map((action) => (
        <ActionIconButton key={action.label} {...action} />
      ))}
    </div>
  );
}

function buildColumns(actions: Omit<RowActionsProps, 'user'>): DataTableColumn<UserSummary>[] {
  return [
    { key: 'name', header: 'Usuário', render: (user) => <NameCell user={user} /> },
    { key: 'email', header: 'Contato', render: (user) => user.email },
    { key: 'role', header: 'Papel', render: (user) => <RoleBadge role={user.role} /> },
    { key: 'status', header: 'Status', render: (user) => <StatusBadge status={user.status} /> },
    { key: 'createdAt', header: 'Cadastro', render: (user) => formatDate(user.createdAt) },
    { key: 'actions', header: 'Ações', render: (user) => <RowActions user={user} {...actions} /> },
  ];
}

export function UsersTable({ users, onView, onEdit, onToggleStatus, onDelete }: UsersTableProps) {
  return (
    <DataTable
      caption="Usuários"
      columns={buildColumns({ onView, onEdit, onToggleStatus, onDelete })}
      rows={users}
      getRowKey={(user) => user.id}
      emptyMessage="Nenhum usuário encontrado"
      onRowClick={onView}
    />
  );
}
