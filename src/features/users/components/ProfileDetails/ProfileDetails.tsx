import { formatDate } from '@/utils/formatDate';

import { roleLabels, statusLabels } from '../../users.labels';
import type { UserSummary } from '../../users.types';
import styles from './ProfileDetails.module.css';

interface ProfileDetailsProps {
  user: UserSummary;
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
  return (
    <dl className={styles.details}>
      <dt>E-mail</dt>
      <dd>{user.email}</dd>
      <dt>Tipo de conta</dt>
      <dd>{roleLabels[user.role]}</dd>
      <dt>Situação</dt>
      <dd>{statusLabels[user.status]}</dd>
      <dt>Membro desde</dt>
      <dd>{formatDate(user.createdAt)}</dd>
    </dl>
  );
}
