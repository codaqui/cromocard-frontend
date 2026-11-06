import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
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

function StatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>;
}

function toggleStatusLabel(status: UserStatus): string {
  return status === 'ACTIVE' ? 'Suspender' : 'Reativar';
}

function RowActions({ user, onEdit, onToggleStatus, onDelete }: RowActionsProps) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={() => onEdit(user)}>
        Editar
      </Button>
      <Button variant="secondary" onClick={() => onToggleStatus(user)}>
        {toggleStatusLabel(user.status)}
      </Button>
      <Button variant="danger" onClick={() => onDelete(user)}>
        Excluir
      </Button>
    </div>
  );
}

function buildColumns(actions: Omit<RowActionsProps, 'user'>): DataTableColumn<UserSummary>[] {
  return [
    { key: 'name', header: 'Nome', render: (user) => user.name },
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
    />
  );
}
