import { Badge, type BadgeTone } from '@/components/Badge/Badge';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import type { UserRole } from '@/types/authenticated-user';
import { formatDate } from '@/utils/formatDate';

import { roleLabels, statusLabels } from '../../users.labels';
import type { UserStatus, UserSummary } from '../../users.types';

interface UsersTableProps {
  users: UserSummary[];
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

const columns: DataTableColumn<UserSummary>[] = [
  { key: 'name', header: 'Nome', render: (user) => user.name },
  { key: 'email', header: 'E-mail', render: (user) => user.email },
  {
    key: 'role',
    header: 'Tipo',
    render: (user) => <Badge tone={roleTones[user.role]}>{roleLabels[user.role]}</Badge>,
  },
  {
    key: 'status',
    header: 'Situação',
    render: (user) => <Badge tone={statusTones[user.status]}>{statusLabels[user.status]}</Badge>,
  },
  { key: 'createdAt', header: 'Cadastro', render: (user) => formatDate(user.createdAt) },
];

export function UsersTable({ users }: UsersTableProps) {
  return (
    <DataTable
      caption="Usuários"
      columns={columns}
      rows={users}
      getRowKey={(user) => user.id}
      emptyMessage="Nenhum usuário encontrado"
    />
  );
}
