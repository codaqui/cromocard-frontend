import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Modal } from '@/components/Modal/Modal';
import { Select, type SelectOption } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';
import { USER_ROLES } from '@/types/authenticated-user';

import { useUserForm } from '../../hooks/useUserForm';
import { roleLabels } from '../../users.labels';
import { useCreateUser, useUpdateUser } from '../../users.queries';
import type { CreateUserInput } from '../../users.schemas';
import type { UserSummary } from '../../users.types';
import styles from './UserFormModal.module.css';

const roleOptions: SelectOption[] = USER_ROLES.map((role) => ({
  value: role,
  label: roleLabels[role],
}));

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
  onClose: () => void;
  onSaved: () => void;
}

type UserFormFields = ReturnType<typeof useUserForm>;

function IdentityFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <>
      <TextField
        label="Nome"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
    </>
  );
}

function UserFormFields({ register, errors, formError }: UserFormFields) {
  return (
    <>
      <IdentityFields register={register} errors={errors} />
      <Select
        label="Papel"
        options={roleOptions}
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
  onClose: () => void;
}

function UserFormModalActions({ formId, isSaving, onClose }: UserFormModalActionsProps) {
  return (
    <>
      <Button variant="secondary" disabled={isSaving} onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} disabled={isSaving}>
        {isSaving ? 'Salvando…' : 'Salvar'}
      </Button>
    </>
  );
}

function useUserFormModal(user: UserSummary | null, onSaved: () => void) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = user ? updateUser : createUser;

  const submit = (input: CreateUserInput) => {
    const action = user
      ? updateUser.mutateAsync({ id: user.id, input })
      : createUser.mutateAsync(input);
    action.then(onSaved).catch(() => undefined);
  };

  return { mutation, form: useUserForm(defaultValuesFor(user), submit, mutation.error) };
}

function UserFormModalContent({ user, onClose, onSaved }: Omit<UserFormModalProps, 'open'>) {
  const formId = useId();
  const { mutation, form } = useUserFormModal(user, onSaved);

  return (
    <Modal
      open
      title={user ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      dismissible={!mutation.isPending}
      footer={
        <UserFormModalActions formId={formId} isSaving={mutation.isPending} onClose={onClose} />
      }
    >
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
