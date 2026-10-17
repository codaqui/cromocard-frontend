import { formatDate } from '@/utils/formatDate';

import { roleLabels, statusLabels } from '../../users.labels';
import type { UserSummary } from '../../users.types';
import styles from './UsersTable.module.css';

interface UsersTableProps {
  users: UserSummary[];
}

function UserRow({ user }: { user: UserSummary }) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{roleLabels[user.role]}</td>
      <td>{statusLabels[user.status]}</td>
      <td>{formatDate(user.createdAt)}</td>
    </tr>
  );
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
