import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { paths } from '@/routes/paths';
import { formatCpf } from '@/utils/formatCpf';
import { formatDate } from '@/utils/formatDate';
import { formatLastAccess } from '@/utils/formatLastAccess';
import { formatPhone } from '@/utils/formatPhone';

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

function initialsOf(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first![0]}${second?.[0] ?? ''}`.toUpperCase();
}

function shortIdOf(id: string): string {
  return `#USR-${id.slice(-6).toUpperCase()}`;
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Navegação">
      <Link to={paths.backoffice.users} className={styles.breadcrumbLink}>
        Usuários
      </Link>
      <span aria-hidden="true">/</span>
      <span>{name}</span>
    </nav>
  );
}

function Identity({ user }: { user: UserSummary }) {
  return (
    <div className={styles.identity}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(user.name)}
      </span>
      <div className={styles.identityText}>
        <h1 className={styles.name}>{user.name}</h1>
        <span className={styles.userId}>{shortIdOf(user.id)}</span>
        <Badge tone={statusTones[user.status]}>{statusLabels[user.status]}</Badge>
      </div>
    </div>
  );
}

interface HeaderActionsProps {
  user: UserSummary;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onResendActivation: () => void;
  isResendingActivation: boolean;
}

function ResendActivationButton({
  user,
  onResendActivation,
  isResendingActivation,
}: {
  user: UserSummary;
  onResendActivation: () => void;
  isResendingActivation: boolean;
}) {
  if (user.lastLoginAt) return null;

  return (
    <Button variant="secondary" onClick={onResendActivation} disabled={isResendingActivation}>
      <Icon name="mail" size={16} />
      Reenviar link de ativação
    </Button>
  );
}

function ToggleAndDeleteButtons({
  status,
  onToggleStatus,
  onDelete,
}: {
  status: UserSummary['status'];
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const toggleStatus = toggleStatusCopyFor(status);

  return (
    <>
      <Button variant="secondary" onClick={onToggleStatus}>
        <Icon name={toggleStatus.icon} size={16} />
        {toggleStatus.label}
      </Button>
      <Button variant="danger" onClick={onDelete}>
        <Icon name="delete" size={16} />
        Excluir
      </Button>
    </>
  );
}

function HeaderActions({ user, onEdit, ...actions }: HeaderActionsProps) {
  return (
    <div className={styles.actions}>
      <Button onClick={onEdit}>
        <Icon name="edit" size={16} />
        Editar
      </Button>
      <ResendActivationButton user={user} {...actions} />
      <ToggleAndDeleteButtons status={user.status} {...actions} />
    </div>
  );
}

interface HeaderCardProps {
  user: UserSummary;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onResendActivation: () => void;
  isResendingActivation: boolean;
}

function HeaderCard({ user, ...actions }: HeaderCardProps) {
  return (
    <div className={styles.headerCard}>
      <Identity user={user} />
      <HeaderActions user={user} {...actions} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className={styles.fieldLabel}>{label}</p>
      <p className={styles.fieldValue}>{children}</p>
    </div>
  );
}

function LastAccessValue({ user }: { user: UserSummary }) {
  if (!user.lastLoginAt) return <>Nunca</>;

  return (
    <>
      {formatLastAccess(user.lastLoginAt)}
      {user.lastLoginIp && <span className={styles.fieldHint}> · {user.lastLoginIp}</span>}
    </>
  );
}

function UserDataFields({ user }: { user: UserSummary }) {
  return (
    <div className={styles.fields}>
      <Field label="E-mail">{user.email}</Field>
      <Field label="Nome de usuário">{user.username ? `@${user.username}` : '—'}</Field>
      <Field label="Papel">
        <Badge tone={roleTones[user.role]}>{roleLabels[user.role]}</Badge>
      </Field>
      <Field label="Telefone">{user.phone ? formatPhone(user.phone) : '—'}</Field>
      <Field label="CPF">{user.cpf ? formatCpf(user.cpf) : '—'}</Field>
      <Field label="Cadastro">{formatDate(user.createdAt)}</Field>
      <Field label="Último acesso">
        <LastAccessValue user={user} />
      </Field>
    </div>
  );
}

function UserDataSection({ user }: { user: UserSummary }) {
  return (
    <section className={styles.section} aria-labelledby="user-data-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name="person" size={18} />
        </span>
        <h2 id="user-data-heading" className={styles.sectionTitle}>
          Dados do usuário
        </h2>
      </div>
      <UserDataFields user={user} />
    </section>
  );
}

function UserDetailContent({ user }: { user: UserSummary }) {
  const navigate = useNavigate();
  const formModal = useUserFormModal();
  const actionDialogs = useUserActionDialogs();
  const backToList = () => void navigate(paths.backoffice.users);

  return (
    <section className={styles.page}>
      <Breadcrumb name={user.name} />
      <HeaderCard
        user={user}
        onEdit={() => formModal.openEdit(user)}
        onToggleStatus={() => actionDialogs.openSuspend(user)}
        onDelete={() => actionDialogs.openDelete(user)}
        onResendActivation={() => actionDialogs.resend(user)}
        isResendingActivation={actionDialogs.isResending}
      />
      <UserDataSection user={user} />
      <UserFormModalWithToast formModal={formModal} />
      <UserActionDialogsWithToast dialogs={actionDialogs} onDeleted={backToList} />
    </section>
  );
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userQuery = useUser(id!);

  if (userQuery.isPending) return <LoadingState />;
  if (userQuery.isError) return <ErrorState message={userQuery.error.message} />;

  return <UserDetailContent user={userQuery.data} />;
}
