import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import { type UserFormDirtyFields, useUserForm } from '../../hooks/useUserForm';
import { roleSelectOptions } from '../../users.labels';
import type { CreateUserFormValues, CreateUserInput } from '../../users.schemas';
import { canResendActivation } from '../../users.format';
import type { EditableUser } from '../../users.types';
import styles from './UserFormModal.module.css';

function cpfOf(user: EditableUser | null): string {
  return user && 'cpf' in user ? (user.cpf ?? '') : '';
}

function defaultValuesFor(user: EditableUser | null): CreateUserFormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'CUSTOMER',
    username: user?.username ?? '',
    cpf: cpfOf(user),
    phone: user?.phone ?? '',
    sendActivation: !user,
  };
}

interface UserFormModalProps {
  open: boolean;
  user: EditableUser | null;
  isSaving: boolean;
  apiError: ApiError | null;
  onClose: () => void;
  onSubmit: (input: CreateUserInput, dirtyFields: UserFormDirtyFields) => void;
}

type UserFormFields = ReturnType<typeof useUserForm>;

function NameAndUsernameFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="Nome completo"
        hint="obrigatório"
        icon="badge"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Nome de usuário"
        hint="único"
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
}: Pick<UserFormFields, 'register'> & { user: EditableUser | null }) {
  if (!user) {
    return (
      <Checkbox
        label="Enviar link de ativação de conta por e-mail"
        hint="O link de ativação vale por 24 horas."
        {...register('sendActivation')}
      />
    );
  }
  if (!canResendActivation(user)) return null;

  return (
    <Checkbox
      label="Reenviar link de ativação"
      hint="O usuário ainda não ativou a conta. O novo link vale por 24 horas."
      {...register('sendActivation')}
    />
  );
}

function UserFormFields({
  register,
  errors,
  formError,
  user,
}: UserFormFields & { user: EditableUser | null }) {
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
  return isSaving ? 'Salvando…' : 'Salvar alterações';
}

function UserFormModalActions({
  formId,
  isSaving,
  isCreating,
  onClose,
}: UserFormModalActionsProps) {
  return (
    <div className={styles.footer}>
      <Button variant="secondary" disabled={isSaving} onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} disabled={isSaving}>
        {submitLabelFor(isCreating, isSaving)}
      </Button>
    </div>
  );
}

function UserFormModalSubtitle({ user }: { user: EditableUser | null }) {
  return (
    <p className={styles.subtitle}>
      {user
        ? `Altere os dados ou o papel de ${user.name}.`
        : 'Preencha os dados do usuário. O papel define o que ele pode fazer na plataforma.'}
    </p>
  );
}

function UserFormModalContent({
  user,
  isSaving,
  apiError,
  onClose,
  onSubmit,
}: Omit<UserFormModalProps, 'open'>) {
  const formId = useId();
  const form = useUserForm(defaultValuesFor(user), onSubmit, apiError);
  const actions = { formId, isSaving, isCreating: !user, onClose };

  return (
    <Modal
      open
      title={user ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      dismissible={!isSaving}
      footer={<UserFormModalActions {...actions} />}
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
