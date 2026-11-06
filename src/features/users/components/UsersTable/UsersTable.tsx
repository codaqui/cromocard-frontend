import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import type { UserRole } from '@/types/authenticated-user';
import { formatDate } from '@/utils/formatDate';

import { roleLabels, statusLabels } from '../../users.labels';
import type { UserStatus, UserSummary } from '../../users.types';

interface UsersTableProps {
  users: UserSummary[];
  onEdit: (user: UserSummary) => void;
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

function EditAction({ user, onEdit }: { user: UserSummary; onEdit: (user: UserSummary) => void }) {
  return (
    <Button variant="secondary" onClick={() => onEdit(user)}>
      Editar
    </Button>
  );
}

function buildColumns(onEdit: (user: UserSummary) => void): DataTableColumn<UserSummary>[] {
  return [
    { key: 'name', header: 'Nome', render: (user) => user.name },
    { key: 'email', header: 'E-mail', render: (user) => user.email },
    { key: 'role', header: 'Tipo', render: (user) => <RoleBadge role={user.role} /> },
    { key: 'status', header: 'Situação', render: (user) => <StatusBadge status={user.status} /> },
    { key: 'createdAt', header: 'Cadastro', render: (user) => formatDate(user.createdAt) },
    {
      key: 'actions',
      header: 'Ações',
      render: (user) => <EditAction user={user} onEdit={onEdit} />,
    },
  ];
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  return (
    <DataTable
      caption="Usuários"
      columns={buildColumns(onEdit)}
      rows={users}
      getRowKey={(user) => user.id}
      emptyMessage="Nenhum usuário encontrado"
    />
  );
}
