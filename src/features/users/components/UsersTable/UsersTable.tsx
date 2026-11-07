import type { MouseEventHandler } from 'react';

import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import type { UserRole } from '@/types/authenticated-user';
import { formatDate } from '@/utils/formatDate';

import { roleLabels, statusLabels } from '../../users.labels';
import type { UserStatus, UserSummary } from '../../users.types';
import styles from './UsersTable.module.css';

interface UsersTableProps {
  users: UserSummary[];
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

interface RowActionsProps {
  user: UserSummary;
  onEdit: (user: UserSummary) => void;
  onToggleStatus: (user: UserSummary) => void;
  onDelete: (user: UserSummary) => void;
}

const statusTones: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

const roleTones: Record<UserRole, BadgeTone> = {
  CUSTOMER: 'neutral',
  SELLER: 'neutral',
  ADMIN: 'info',
};

function RoleBadge({ role }: { role: UserRole }) {
  return <Badge tone={roleTones[role]}>{roleLabels[role]}</Badge>;
}

function initialsOf(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
}

function shortIdOf(id: string): string {
  return `#USR-${id.slice(-6).toUpperCase()}`;
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

interface ToggleStatusCopy {
  label: string;
  icon: IconName;
}

function toggleStatusCopy(status: UserStatus): ToggleStatusCopy {
  return status === 'ACTIVE'
    ? { label: 'Suspender', icon: 'pause' }
    : { label: 'Reativar', icon: 'playArrow' };
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

function RowActions({ user, onEdit, onToggleStatus, onDelete }: RowActionsProps) {
  const toggleStatus = toggleStatusCopy(user.status);

  return (
    <div className={styles.actions}>
      <ActionIconButton
        label="Editar"
        icon="edit"
        variant="secondary"
        onClick={() => onEdit(user)}
      />
      <ActionIconButton
        label={toggleStatus.label}
        icon={toggleStatus.icon}
        variant="secondary"
        onClick={() => onToggleStatus(user)}
      />
      <ActionIconButton
        label="Excluir"
        icon="delete"
        variant="danger"
        onClick={() => onDelete(user)}
      />
    </div>
  );
}

function buildColumns(actions: Omit<RowActionsProps, 'user'>): DataTableColumn<UserSummary>[] {
  return [
    { key: 'name', header: 'Nome', render: (user) => <NameCell user={user} /> },
    { key: 'email', header: 'E-mail', render: (user) => user.email },
    { key: 'role', header: 'Tipo', render: (user) => <RoleBadge role={user.role} /> },
    { key: 'status', header: 'Situação', render: (user) => <StatusBadge status={user.status} /> },
    { key: 'createdAt', header: 'Cadastro', render: (user) => formatDate(user.createdAt) },
    { key: 'actions', header: 'Ações', render: (user) => <RowActions user={user} {...actions} /> },
  ];
}

export function UsersTable({ users, onEdit, onToggleStatus, onDelete }: UsersTableProps) {
  return (
    <DataTable
      caption="Usuários"
      columns={buildColumns({ onEdit, onToggleStatus, onDelete })}
      rows={users}
      getRowKey={(user) => user.id}
      emptyMessage="Nenhum usuário encontrado"
      onRowClick={onEdit}
    />
  );
}
