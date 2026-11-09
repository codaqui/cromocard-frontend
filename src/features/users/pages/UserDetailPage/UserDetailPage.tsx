import { useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { paths } from '@/routes/paths';
import { formatDate } from '@/utils/formatDate';

import { UserActionDialogsWithToast } from '../../components/UserActionDialogsWithToast/UserActionDialogsWithToast';
import { UserFormModalWithToast } from '../../components/UserFormModalWithToast/UserFormModalWithToast';
import { useUserActionDialogs } from '../../hooks/useUserActionDialogs';
import { useUserFormModal } from '../../hooks/useUserFormModal';
import {
  roleLabels,
  roleTones,
  statusLabels,
  statusTones,
  toggleStatusCopyFor,
} from '../../users.labels';
import { useUser } from '../../users.queries';
import type { UserSummary } from '../../users.types';
import styles from './UserDetailPage.module.css';

function DetailHeader({ user }: { user: UserSummary }) {
  const navigate = useNavigate();

  return (
    <div className={styles.header}>
      <div>
        <Button
          variant="secondary"
          className={styles.backButton}
          onClick={() => void navigate(paths.backoffice.users)}
        >
          <Icon name="arrowBack" size={16} />
          Voltar para usuários
        </Button>
        <p className={styles.eyebrow}>BackOffice · Administração</p>
        <h1 className={styles.title}>{user.name}</h1>
      </div>
    </div>
  );
}

function UserDetails({ user }: { user: UserSummary }) {
  return (
    <dl className={styles.details}>
      <dt>E-mail</dt>
      <dd>{user.email}</dd>
      <dt>Papel</dt>
      <dd>
        <Badge tone={roleTones[user.role]}>{roleLabels[user.role]}</Badge>
      </dd>
      <dt>Situação</dt>
      <dd>
        <Badge tone={statusTones[user.status]}>{statusLabels[user.status]}</Badge>
      </dd>
      <dt>Cadastro</dt>
      <dd>{formatDate(user.createdAt)}</dd>
    </dl>
  );
}

interface DetailActionsProps {
  user: UserSummary;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function DetailActions({ user, onEdit, onToggleStatus, onDelete }: DetailActionsProps) {
  const toggleStatus = toggleStatusCopyFor(user.status);

  return (
    <div className={styles.actions}>
      <Button onClick={onEdit}>
        <Icon name="edit" size={16} />
        Editar
      </Button>
      <Button variant="secondary" onClick={onToggleStatus}>
        <Icon name={toggleStatus.icon} size={16} />
        {toggleStatus.label}
      </Button>
      <Button variant="danger" onClick={onDelete}>
        <Icon name="delete" size={16} />
        Excluir
      </Button>
    </div>
  );
}

function UserDetailContent({ user }: { user: UserSummary }) {
  const navigate = useNavigate();
  const formModal = useUserFormModal();
  const actionDialogs = useUserActionDialogs();
  const backToList = () => void navigate(paths.backoffice.users);

  return (
    <section className={styles.page}>
      <DetailHeader user={user} />
      <UserDetails user={user} />
      <DetailActions
        user={user}
        onEdit={() => formModal.openEdit(user)}
        onToggleStatus={() => actionDialogs.openSuspend(user)}
        onDelete={() => actionDialogs.openDelete(user)}
      />
      <UserFormModalWithToast formModal={formModal} />
      <UserActionDialogsWithToast dialogs={actionDialogs} onDeleted={backToList} />
    </section>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userQuery = useUser(id ?? '');

  if (userQuery.isPending) return <LoadingState />;
  if (userQuery.isError) return <ErrorState message={userQuery.error.message} />;

  return <UserDetailContent user={userQuery.data} />;
}
