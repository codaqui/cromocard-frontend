import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';
import { maskCpf } from '@/utils/formatCpf';
import { formatDate } from '@/utils/formatDate';
import { formatLastAccess } from '@/utils/formatLastAccess';
import { formatPhone } from '@/utils/formatPhone';

import { UserActionDialogsWithToast } from '../../components/UserActionDialogsWithToast/UserActionDialogsWithToast';
import { UserFormModalWithToast } from '../../components/UserFormModalWithToast/UserFormModalWithToast';
import { useUserActionDialogs } from '../../hooks/useUserActionDialogs';
import { useUserFormModal } from '../../hooks/useUserFormModal';
import { initialsOf, shortIdOf } from '../../users.format';
import { adminActionLabels, roleLabels, roleTones } from '../../users.labels';
import { useUser } from '../../users.queries';
import type { AdminActionEntry, UserAddress, UserDetail } from '../../users.types';
import styles from './UserDetailPage.module.css';

const monthYearFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const SELF_UNAVAILABLE = 'Indisponível na própria conta';

function monthYearOf(isoDate: string): string {
  const formatted = monthYearFormatter.format(new Date(isoDate));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function TopBar({ user }: { user: UserDetail }) {
  return (
    <div className={styles.topBar}>
      <nav className={styles.breadcrumb} aria-label="Navegação">
        <Link to={paths.backoffice.users} className={styles.breadcrumbLink}>
          Gestão de Usuários
        </Link>
        <span aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>Usuário {shortIdOf(user.id)}</span>
      </nav>
      <span className={styles.lastAccessPill}>
        Último acesso{' '}
        {user.lastLoginAt ? formatLastAccess(user.lastLoginAt).toLowerCase() : 'nunca'}
      </span>
    </div>
  );
}

const STATUS_OPTIONS = [
  { key: 'ACTIVE', label: 'Ativo', icon: 'checkCircle' },
  { key: 'SUSPENDED', label: 'Suspenso', icon: 'pause' },
  { key: 'BLOCKED', label: 'Bloqueado', icon: 'block' },
] as const;

interface StatusControlProps {
  status: UserDetail['status'];
  isSelf: boolean;
  onToggleStatus: () => void;
}

/** Trocar entre Ativo e Suspenso abre o diálogo de suspender ou reativar; Bloqueado é da CCD099. */
function StatusControl({ status, isSelf, onToggleStatus }: StatusControlProps) {
  return (
    <div className={styles.statusControl} role="group" aria-label="Status da conta">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={styles.statusOption}
          aria-pressed={option.key === status}
          disabled={isSelf || option.key === 'BLOCKED'}
          title={isSelf ? SELF_UNAVAILABLE : undefined}
          onClick={option.key === status ? undefined : onToggleStatus}
        >
          <Icon name={option.icon} size={14} />
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ProfileMeta({ user }: { user: UserDetail }) {
  return (
    <div className={styles.profileMeta}>
      <div>
        <p className={styles.metaLabel}>Membro desde:</p>
        <p className={styles.metaValue}>{monthYearOf(user.createdAt)}</p>
      </div>
      <div className={styles.metaDivider}>
        <p className={styles.metaLabel}>Advertências:</p>
        <p className={styles.metaValue}>Nenhuma</p>
      </div>
    </div>
  );
}

function Identity({ user }: { user: UserDetail }) {
  return (
    <div className={styles.identity}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(user.name)}
      </span>
      <div className={styles.identityText}>
        <h1 className={styles.name}>{user.name}</h1>
        <Badge tone={roleTones[user.role]}>{roleLabels[user.role]}</Badge>
        <ProfileMeta user={user} />
      </div>
    </div>
  );
}

type ProfileHeaderProps = { user: UserDetail } & Omit<StatusControlProps, 'status'>;

function ProfileHeader({ user, ...status }: ProfileHeaderProps) {
  return (
    <header className={styles.headerCard}>
      <div className={styles.headerTop}>
        <Identity user={user} />
        <StatusControl status={user.status} {...status} />
      </div>
      <p className={styles.registeredAt}>
        <Icon name="calendar" size={16} />
        Cadastro em {formatDate(user.createdAt)}
      </p>
    </header>
  );
}

interface CardProps {
  id: string;
  icon: IconName;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

function Card({ id, icon, title, aside, children }: CardProps) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        {aside && <span className={styles.sectionAside}>{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <p className={styles.fieldLabel}>{label}</p>
      <p className={styles.fieldValue}>{children}</p>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

function PersonalDataCard({ user }: { user: UserDetail }) {
  return (
    <Card id="personal-data-heading" icon="badge" title="Dados Pessoais">
      <div className={styles.fields}>
        <Field label="Nome completo">{user.name}</Field>
        <Field label="Nome de usuário">{user.username ? `@${user.username}` : '—'}</Field>
        <Field
          label="ID do usuário"
          hint={user.emailVerified ? 'E-mail confirmado' : 'E-mail não confirmado'}
        >
          {shortIdOf(user.id)}
        </Field>
        <Field label="CPF">{user.cpf ? maskCpf(user.cpf) : '—'}</Field>
        <Field label="Data de cadastro">{formatDate(user.createdAt)}</Field>
        <Field label="Papel">{roleLabels[user.role]}</Field>
      </div>
    </Card>
  );
}

function authMethodLabel(oauthProvider: string | null): string {
  if (!oauthProvider) return 'E-mail e senha';
  return oauthProvider.toLowerCase() === 'google'
    ? 'Login com Google'
    : `Login com ${oauthProvider}`;
}

function ContactSecurityCard({ user }: { user: UserDetail }) {
  return (
    <Card id="contact-security-heading" icon="shield" title="Contato & Segurança">
      <div className={styles.fields}>
        <Field label="E-mail" hint={user.emailVerified ? 'Verificado via link' : 'Não verificado'}>
          {user.email}
        </Field>
        <Field label="Telefone">{user.phone ? formatPhone(user.phone) : '—'}</Field>
        <Field label="Autenticação" hint={`Desde ${formatDate(user.createdAt)}`}>
          {authMethodLabel(user.oauthProvider)}
        </Field>
        <Field label="Último login" hint={user.lastLoginIp && `IP ${user.lastLoginIp}`}>
          {user.lastLoginAt ? formatLastAccess(user.lastLoginAt) : 'Nunca'}
        </Field>
      </div>
    </Card>
  );
}

function AddressItem({ address }: { address: UserAddress }) {
  return (
    <li className={styles.addressItem}>
      <p className={styles.fieldLabel}>
        {address.isPrimary ? 'Endereço principal' : address.label}
      </p>
      <p className={styles.fieldValue}>
        {address.street}, {address.number}
        {address.complement && ` - ${address.complement}`} - {address.neighborhood}
      </p>
      <p className={styles.fieldHint}>
        {address.city} - {address.state} • CEP {address.zipCode}
      </p>
    </li>
  );
}

function AddressesCard({ addresses }: { addresses: UserAddress[] }) {
  const count = `${addresses.length} ${addresses.length === 1 ? 'endereço' : 'endereços'}`;
  return (
    <Card id="addresses-heading" icon="location" title="Endereço de Entrega" aside={count}>
      {addresses.length === 0 ? (
        <p className={styles.fieldHint}>Nenhum endereço cadastrado.</p>
      ) : (
        <ul className={styles.addressList}>
          {addresses.map((address) => (
            <AddressItem key={address.id} address={address} />
          ))}
        </ul>
      )}
    </Card>
  );
}

interface ActionRowProps {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}

function ActionRow({ icon, title, description, children }: ActionRowProps) {
  return (
    <li className={styles.actionRow}>
      <span className={styles.sectionIcon} aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <div className={styles.actionText}>
        <p className={styles.fieldValue}>{title}</p>
        <p className={styles.fieldHint}>{description}</p>
      </div>
      <div className={styles.actionButtons}>{children}</div>
    </li>
  );
}

interface UserActionsCardProps {
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SanctionRow({ isSelf }: { isSelf: boolean }) {
  const description = isSelf ? SELF_UNAVAILABLE : 'Advertir, suspender ou banir, com justificativa';
  return (
    <ActionRow icon="reports" title="Aplicar sanção" description={description}>
      <Button variant="secondary" disabled title="Em breve">
        {isSelf ? 'Indisponível' : 'Aplicar'}
      </Button>
    </ActionRow>
  );
}

function EditOrDeleteRow({ isSelf, onEdit, onDelete }: UserActionsCardProps) {
  const description = isSelf
    ? 'Você não pode excluir nem rebaixar a própria conta'
    : 'Dados, papel ou exclusão (pode ser restaurada)';
  return (
    <ActionRow icon="edit" title="Editar ou excluir" description={description}>
      <Button variant="secondary" onClick={onEdit}>
        Editar
      </Button>
      <Button
        variant="secondary"
        onClick={onDelete}
        disabled={isSelf}
        title={isSelf ? SELF_UNAVAILABLE : undefined}
      >
        Excluir
      </Button>
    </ActionRow>
  );
}

function UserActionsCard(props: UserActionsCardProps) {
  const aside = props.isSelf ? 'Sua própria conta' : '0 advertências';
  return (
    <Card id="user-actions-heading" icon="settings" title="Ações sobre o usuário" aside={aside}>
      <ul className={styles.actionList}>
        <SanctionRow isSelf={props.isSelf} />
        <EditOrDeleteRow {...props} />
      </ul>
    </Card>
  );
}

function AdminActionItem({ entry }: { entry: AdminActionEntry }) {
  return (
    <li className={styles.logItem}>
      <div className={styles.logHeader}>
        <span className={styles.logAction}>{adminActionLabels[entry.action] ?? entry.action}</span>
        <span className={styles.fieldHint}>{formatLastAccess(entry.createdAt)}</span>
      </div>
      <p className={styles.fieldValue}>
        {entry.admin.name}
        {entry.reason && ` · ${entry.reason}`}
      </p>
    </li>
  );
}

function AdminActionsCard({ actions }: { actions: AdminActionEntry[] }) {
  return (
    <Card
      id="admin-actions-heading"
      icon="reports"
      title="Ações administrativas"
      aside="Últimas ações"
    >
      {actions.length === 0 ? (
        <p className={styles.fieldHint}>Nenhuma ação registrada.</p>
      ) : (
        <ul className={styles.logList}>
          {actions.map((entry) => (
            <AdminActionItem key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </Card>
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
  const { formModal, actionDialogs, backToList, onEdit, onToggleStatus, onDelete } =
    useUserDetailActions(user);
  const isSelf = currentUser?.id === user.id;

  return (
    <section className={styles.page}>
      <TopBar user={user} />
      <ProfileHeader user={user} isSelf={isSelf} onToggleStatus={onToggleStatus} />
      <div className={styles.columns}>
        <div className={styles.column}>
          <PersonalDataCard user={user} />
          <ContactSecurityCard user={user} />
          <AddressesCard addresses={user.addresses} />
        </div>
        <div className={styles.column}>
          <UserActionsCard isSelf={isSelf} onEdit={onEdit} onDelete={onDelete} />
          <AdminActionsCard actions={user.adminActions} />
        </div>
      </div>
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
