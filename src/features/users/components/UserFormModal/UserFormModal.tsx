import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';

import { useUserForm } from '../../hooks/useUserForm';
import { roleSelectOptions } from '../../users.labels';
import { useCreateUser, useUpdateUser } from '../../users.queries';
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
  onClose: () => void;
  onSaved: () => void;
}

type UserFormFields = ReturnType<typeof useUserForm>;

function IdentityFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField
        label="Nome"
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
  onClose: () => void;
}

function UserFormModalActions({ formId, isSaving, onClose }: UserFormModalActionsProps) {
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
          {isSaving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}

function useUserFormSubmission(user: UserSummary | null, onSaved: () => void) {
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
  const { mutation, form } = useUserFormSubmission(user, onSaved);

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
