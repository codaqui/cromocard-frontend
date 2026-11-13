import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
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
  adminActionLabels,
  roleLabels,
  roleTones,
  statusLabels,
  statusTones,
  toggleStatusCopyFor,
} from '../../users.labels';
import { useUser } from '../../users.queries';
import type { AdminActionEntry, UserAddress, UserDetail, UserSummary } from '../../users.types';
import styles from './UserDetailPage.module.css';

function initialsOf(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return `${first![0]}${second?.[0] ?? ''}`.toUpperCase();
}

function shortIdOf(id: string): string {
  return `#USR-${id.slice(-6).toUpperCase()}`;
}

function monthYearOf(isoDate: string): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  );
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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

const STATUS_TABS = [
  { key: 'ACTIVE', label: 'Ativo' },
  { key: 'SUSPENDED', label: 'Suspenso' },
  { key: 'BLOCKED', label: 'Bloqueado' },
] as const;

function StatusTabs({ status }: { status: UserSummary['status'] }) {
  return (
    <div className={styles.statusTabs} role="group" aria-label="Status da conta">
      {STATUS_TABS.map((tab) => (
        <span
          key={tab.key}
          className={styles.statusTab}
          data-active={tab.key === status}
          data-disabled={tab.key === 'BLOCKED'}
        >
          {tab.label}
        </span>
      ))}
    </div>
  );
}

function MembershipRow({ user }: { user: UserSummary }) {
  return (
    <div className={styles.membership}>
      <span className={styles.fieldHint}>Membro desde: {monthYearOf(user.createdAt)}</span>
      <StatusTabs status={user.status} />
    </div>
  );
}

interface HeaderActionsProps {
  user: UserSummary;
  isSelf: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function SanctionButton() {
  return (
    <Button variant="secondary" disabled title="Disponível na CCD099">
      <Icon name="reports" size={16} />
      Aplicar sanção
    </Button>
  );
}

interface ToggleAndDeleteButtonsProps {
  status: UserSummary['status'];
  isSelf: boolean;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function ToggleAndDeleteButtons({
  status,
  isSelf,
  onToggleStatus,
  onDelete,
}: ToggleAndDeleteButtonsProps) {
  const toggleStatus = toggleStatusCopyFor(status);
  const title = isSelf ? 'Indisponível na própria conta' : undefined;

  return (
    <>
      <Button variant="secondary" onClick={onToggleStatus} disabled={isSelf} title={title}>
        <Icon name={toggleStatus.icon} size={16} />
        {toggleStatus.label}
      </Button>
      <Button variant="danger" onClick={onDelete} disabled={isSelf} title={title}>
        <Icon name="delete" size={16} />
        Excluir
      </Button>
    </>
  );
}

function HeaderActions({ user, isSelf, onEdit, ...actions }: HeaderActionsProps) {
  return (
    <div className={styles.actions}>
      <Button onClick={onEdit}>
        <Icon name="edit" size={16} />
        Editar
      </Button>
      <SanctionButton />
      <ToggleAndDeleteButtons status={user.status} isSelf={isSelf} {...actions} />
    </div>
  );
}

interface HeaderCardProps {
  user: UserSummary;
  isSelf: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function HeaderCard({ user, isSelf, ...actions }: HeaderCardProps) {
  return (
    <div className={styles.headerCard}>
      <div className={styles.headerMain}>
        <Identity user={user} />
        <MembershipRow user={user} />
      </div>
      <HeaderActions user={user} isSelf={isSelf} {...actions} />
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

function authMethodLabel(oauthProvider: string | null): string {
  if (!oauthProvider) return 'E-mail e senha';
  return oauthProvider === 'google' ? 'Login com Google' : `Login com ${oauthProvider}`;
}

function AuthenticationSection({ user }: { user: UserDetail }) {
  return (
    <section className={styles.section} aria-labelledby="authentication-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name="lock" size={18} />
        </span>
        <h2 id="authentication-heading" className={styles.sectionTitle}>
          Autenticação
        </h2>
      </div>
      <div className={styles.fields}>
        <Field label="Método">{authMethodLabel(user.oauthProvider)}</Field>
      </div>
    </section>
  );
}

function addressLineOf(address: UserAddress): string {
  return `${address.street}, ${address.number} · ${address.neighborhood}, ${address.city}/${address.state}`;
}

function AddressItem({ address }: { address: UserAddress }) {
  return (
    <li className={styles.addressItem}>
      <p className={styles.fieldValue}>
        {address.label}
        {address.isPrimary && <Badge tone="info">Principal</Badge>}
      </p>
      <p className={styles.fieldHint}>
        {addressLineOf(address)} · CEP {address.zipCode}
      </p>
    </li>
  );
}

function AddressesSection({ addresses }: { addresses: UserAddress[] }) {
  return (
    <section className={styles.section} aria-labelledby="addresses-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name="badge" size={18} />
        </span>
        <h2 id="addresses-heading" className={styles.sectionTitle}>
          Endereço de entrega
        </h2>
      </div>
      {addresses.length === 0 ? (
        <p className={styles.fieldHint}>Nenhum endereço cadastrado.</p>
      ) : (
        <ul className={styles.addressList}>
          {addresses.map((address) => (
            <AddressItem key={address.id} address={address} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AdminActionItem({ entry }: { entry: AdminActionEntry }) {
  return (
    <li className={styles.logItem}>
      <div className={styles.logHeader}>
        <span className={styles.logAction}>{adminActionLabels[entry.action]}</span>
        <span className={styles.fieldHint}>{formatLastAccess(entry.createdAt)}</span>
      </div>
      <p className={styles.fieldHint}>
        {entry.admin.name}
        {entry.reason && ` · ${entry.reason}`}
      </p>
    </li>
  );
}

function AdminActionsSection({ actions }: { actions: AdminActionEntry[] }) {
  return (
    <section className={styles.section} aria-labelledby="admin-actions-heading">
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name="reports" size={18} />
        </span>
        <h2 id="admin-actions-heading" className={styles.sectionTitle}>
          Ações administrativas
        </h2>
      </div>
      {actions.length === 0 ? (
        <p className={styles.fieldHint}>Nenhuma ação registrada.</p>
      ) : (
        <ul className={styles.logList}>
          {actions.map((entry) => (
            <AdminActionItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function useUserDetailActions(user: UserDetail) {
  const navigate = useNavigate();
  const formModal = useUserFormModal();
  const actionDialogs = useUserActionDialogs();

  return {
    formModal,
    actionDialogs,
    onEdit: () => formModal.openEdit(user),
    onToggleStatus: () => actionDialogs.openSuspend(user),
    onDelete: () => actionDialogs.openDelete(user),
    backToList: () => void navigate(paths.backoffice.users),
  };
}

function UserDetailContent({ user }: { user: UserDetail }) {
  const { user: currentUser } = useAuth();
  const { formModal, actionDialogs, backToList, ...handlers } = useUserDetailActions(user);
  const isSelf = currentUser?.id === user.id;

  return (
    <section className={styles.page}>
      <Breadcrumb name={user.name} />
      <HeaderCard user={user} isSelf={isSelf} {...handlers} />
      <UserDataSection user={user} />
      <AuthenticationSection user={user} />
      <AddressesSection addresses={user.addresses} />
      <AdminActionsSection actions={user.adminActions} />
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
