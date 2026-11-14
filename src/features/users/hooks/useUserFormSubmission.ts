import { useCreateUser, useResendActivation, useUpdateUser } from '../users.queries';
import { canResendActivation } from '../users.format';
import type { AdminUpdateUserInput, CreateUserInput } from '../users.schemas';
import type { EditableUser, UserSummary } from '../users.types';
import type { UserFormDirtyFields } from './useUserForm';
import type { UserFormSavedResult } from './useUserFormModal';

const CLEARABLE_FIELDS = ['username', 'cpf', 'phone'] as const;
const PLAIN_FIELDS = ['name', 'email', 'role'] as const;

/**
 * A edição manda só o que a pessoa mexeu. Um campo opcional esvaziado vai como `null` (apagar, R4); um campo que
 * o formulário nem carregou (o CPF, quando a edição abre pela lista) não vai, e o dado fica como está.
 */
export function toUpdateInput(input: CreateUserInput, dirty: UserFormDirtyFields) {
  const changes: AdminUpdateUserInput = {};
  PLAIN_FIELDS.filter((field) => dirty[field]).forEach((field) => {
    Object.assign(changes, { [field]: input[field] });
  });
  CLEARABLE_FIELDS.filter((field) => dirty[field]).forEach((field) => {
    Object.assign(changes, { [field]: input[field] ?? null });
  });
  return changes;
}

type OnSaved = (result: UserFormSavedResult) => void;

/** Edita e, se pedido e permitido, reenvia o link; o modal só fecha quando as duas chamadas dão certo. */
function useUpdateWithResend(user: EditableUser | null, onSaved: OnSaved) {
  const updateUser = useUpdateUser();
  const resendActivation = useResendActivation();

  const submit = (id: string, input: CreateUserInput, dirty: UserFormDirtyFields) => {
    const resend = canResendActivation(user) && input.sendActivation;
    const finish = (saved: UserSummary) => onSaved({ user: saved, sendActivation: resend });
    updateUser.mutate(
      { id, input: toUpdateInput(input, dirty) },
      {
        onSuccess: (saved) =>
          resend
            ? resendActivation.mutate(saved.id, { onSuccess: () => finish(saved) })
            : finish(saved),
      },
    );
  };

  return {
    submit,
    isPending: updateUser.isPending || resendActivation.isPending,
    error: updateUser.error ?? resendActivation.error,
  };
}

/** Escolhe entre criar e editar e avisa `onSaved` só quando a API confirma (ADR-042: o container fala com a API). */
export function useUserFormSubmission(user: EditableUser | null, onSaved: OnSaved) {
  const createUser = useCreateUser();
  const update = useUpdateWithResend(user, onSaved);

  const submit = (input: CreateUserInput, dirty: UserFormDirtyFields) => {
    if (user) return update.submit(user.id, input, dirty);
    createUser.mutate(input, {
      onSuccess: (saved) => onSaved({ user: saved, sendActivation: input.sendActivation }),
    });
  };

  return user
    ? { submit, isSaving: update.isPending, apiError: update.error }
    : { submit, isSaving: createUser.isPending, apiError: createUser.error };
}
