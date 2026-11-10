import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';

import { useUserForm } from '../../hooks/useUserForm';
import { roleSelectOptions } from '../../users.labels';
import { useCreateUser, useUpdateUser } from '../../users.queries';
import type { CreateUserFormValues, CreateUserInput } from '../../users.schemas';
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

function ComplementaryFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <div className={styles.grid}>
      <TextField label="CPF" error={errors.cpf?.message} {...register('cpf')} />
      <TextField
        label="Telefone"
        icon="phone"
        error={errors.phone?.message}
        {...register('phone')}
      />
    </div>
  );
}

function RoleAndUsernameFields({ register, errors }: Pick<UserFormFields, 'register' | 'errors'>) {
  return (
    <>
      <Select
        label="Papel"
        icon="shield"
        options={roleSelectOptions}
        error={errors.role?.message}
        {...register('role')}
      />
      <TextField
        label="Nome de usuário (@)"
        icon="mail"
        error={errors.username?.message}
        {...register('username')}
      />
    </>
  );
}

function ActivationField({
  register,
  isCreating,
}: Pick<UserFormFields, 'register'> & { isCreating: boolean }) {
  if (!isCreating) return null;
  return (
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
  isCreating,
}: UserFormFields & { isCreating: boolean }) {
  return (
    <>
      <IdentityFields register={register} errors={errors} />
      <RoleAndUsernameFields register={register} errors={errors} />
      <ComplementaryFields register={register} errors={errors} />
      <ActivationField register={register} isCreating={isCreating} />
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
        <UserFormModalActions
          formId={formId}
          isSaving={mutation.isPending}
          isCreating={!user}
          onClose={onClose}
        />
      }
    >
      <UserFormModalSubtitle user={user} />
      <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
        <UserFormFields {...form} isCreating={!user} />
      </form>
    </Modal>
  );
}

export function UserFormModal({ open, ...contentProps }: UserFormModalProps) {
  if (!open) return null;
  return <UserFormModalContent {...contentProps} />;
}
