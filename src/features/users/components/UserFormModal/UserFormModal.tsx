import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import { useUserForm } from '../../hooks/useUserForm';
import { roleSelectOptions } from '../../users.labels';
import type { CreateUserInput } from '../../users.schemas';
import type { UserSummary } from '../../users.types';
import styles from './UserFormModal.module.css';

function defaultValuesFor(user: UserSummary | null): CreateUserInput {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'CUSTOMER',
  };
}

interface UserFormModalProps {
  open: boolean;
  user: UserSummary | null;
  isSaving: boolean;
  apiError: ApiError | null;
  onClose: () => void;
  onSubmit: (input: CreateUserInput) => void;
}

type UserFormFields = ReturnType<typeof useUserForm>;

function IdentityFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="Nome completo"
        hint="obrigatório"
        icon="person"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="E-mail"
        icon="envelope"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
    </div>
  );
}

function UserFormFields({ register, errors, formError }: UserFormFields) {
  return (
    <>
      <IdentityFields register={register} errors={errors} />
      <Select
        label="Papel"
        icon="shield"
        options={roleSelectOptions}
        error={errors.role?.message}
        {...register('role')}
      />
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

function UserFormModalSubtitle({ user }: { user: UserSummary | null }) {
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
        <UserFormFields {...form} />
      </form>
    </Modal>
  );
}

export function UserFormModal({ open, ...contentProps }: UserFormModalProps) {
  if (!open) return null;
  return <UserFormModalContent {...contentProps} />;
}
