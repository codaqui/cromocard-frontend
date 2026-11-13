import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';

import { useUserForm } from '../../hooks/useUserForm';
import type { UserFormSavedResult } from '../../hooks/useUserFormModal';
import { roleSelectOptions } from '../../users.labels';
import { useCreateUser, useResendActivation, useUpdateUser } from '../../users.queries';
import type {
  AdminUpdateUserInput,
  CreateUserFormValues,
  CreateUserInput,
} from '../../users.schemas';
import type { UserSummary } from '../../users.types';
import styles from './UserFormModal.module.css';

function defaultValuesFor(user: UserSummary | null): CreateUserFormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'CUSTOMER',
    username: user?.username ?? '',
    cpf: user?.cpf ?? '',
    phone: user?.phone ?? '',
    sendActivation: true,
  };
}

interface UserFormModalProps {
  open: boolean;
  user: UserSummary | null;
  onClose: () => void;
  onSaved: (result: UserFormSavedResult) => void;
}

type UserFormFields = ReturnType<typeof useUserForm>;

function NameAndUsernameFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="Nome completo"
        icon="badge"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Nome de usuário"
        icon="mail"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
    </div>
  );
}

function EmailAndCpfFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="E-mail"
        icon="envelope"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="CPF"
        icon="badge"
        inputMode="numeric"
        autoComplete="off"
        error={errors.cpf?.message}
        {...register('cpf')}
      />
    </div>
  );
}

function PhoneAndRoleFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="Telefone com DDD"
        icon="phone"
        inputMode="tel"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Select
        label="Papel"
        icon="shield"
        options={roleSelectOptions}
        error={errors.role?.message}
        {...register('role')}
      />
    </div>
  );
}

function ActivationField({
  register,
  user,
}: Pick<UserFormFields, 'register'> & { user: UserSummary | null }) {
  if (user?.emailVerified) return null;

  return user ? (
    <Checkbox
      label="Reenviar link de ativação"
      hint="O usuário ainda não ativou a conta. O novo link vale por 24 horas."
      {...register('sendActivation')}
    />
  ) : (
    <Checkbox
      label="Enviar link de ativação de conta por e-mail"
      hint="O link vale por 24 horas. Sem marcar, a conta é criada sem enviar e-mail."
      {...register('sendActivation')}
    />
  );
}

function UserFormFields({
  register,
  errors,
  formError,
  user,
}: UserFormFields & { user: UserSummary | null }) {
  return (
    <>
      <NameAndUsernameFields register={register} errors={errors} />
      <EmailAndCpfFields register={register} errors={errors} />
      <PhoneAndRoleFields register={register} errors={errors} />
      <ActivationField register={register} user={user} />
      <FormError message={formError} />
    </>
  );
}

interface UserFormModalActionsProps {
  formId: string;
  isSaving: boolean;
  isCreating: boolean;
  onClose: () => void;
}

function submitLabelFor(isCreating: boolean, isSaving: boolean): string {
  if (isCreating) return isSaving ? 'Cadastrando…' : 'Cadastrar Usuário';
  return isSaving ? 'Salvando…' : 'Salvar';
}

function UserFormModalActions({
  formId,
  isSaving,
  isCreating,
  onClose,
}: UserFormModalActionsProps) {
  return (
    <div className={styles.footer}>
      <span className={styles.protected}>
        <Icon name="lock" size={16} />
        protegido
      </span>
      <div className={styles.footerButtons}>
        <Button variant="secondary" disabled={isSaving} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form={formId} disabled={isSaving}>
          {submitLabelFor(isCreating, isSaving)}
        </Button>
      </div>
    </div>
  );
}

function toUpdateInput({
  sendActivation: _sendActivation,
  username,
  cpf,
  phone,
  ...rest
}: CreateUserInput): AdminUpdateUserInput {
  return { ...rest, username: username ?? null, cpf: cpf ?? null, phone: phone ?? null };
}

function shouldResendActivation(user: UserSummary | null, sendActivation: boolean): boolean {
  return Boolean(user && !user.emailVerified && sendActivation);
}

function useUserFormSubmission(
  user: UserSummary | null,
  onSaved: (result: UserFormSavedResult) => void,
) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const resendActivation = useResendActivation();
  const mutation = user ? updateUser : createUser;
  const isSaving = mutation.isPending || resendActivation.isPending;

  const submit = (input: CreateUserInput) => {
    const action = user
      ? updateUser.mutateAsync({ id: user.id, input: toUpdateInput(input) })
      : createUser.mutateAsync(input);

    action
      .then(async (saved) => {
        if (shouldResendActivation(user, input.sendActivation)) {
          await resendActivation.mutateAsync(saved.id);
        }
        onSaved({ user: saved, sendActivation: input.sendActivation });
      })
      .catch(() => undefined);
  };

  return { mutation, isSaving, form: useUserForm(defaultValuesFor(user), submit, mutation.error) };
}

function UserFormModalSubtitle({ user }: { user: UserSummary | null }) {
  return (
    <p className={styles.subtitle}>
      {user
        ? 'Atualize as informações do usuário.'
        : 'Cadastre um novo usuário atribuindo as informações corretamente.'}
    </p>
  );
}

function UserFormModalContent({ user, onClose, onSaved }: Omit<UserFormModalProps, 'open'>) {
  const formId = useId();
  const { isSaving, form } = useUserFormSubmission(user, onSaved);

  return (
    <Modal
      open
      title={user ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      dismissible={!isSaving}
      footer={
        <UserFormModalActions
          formId={formId}
          isSaving={isSaving}
          isCreating={!user}
          onClose={onClose}
        />
      }
    >
      <UserFormModalSubtitle user={user} />
      <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
        <UserFormFields {...form} user={user} />
      </form>
    </Modal>
  );
}

export function UserFormModal({ open, ...contentProps }: UserFormModalProps) {
  if (!open) return null;
  return <UserFormModalContent {...contentProps} />;
}
