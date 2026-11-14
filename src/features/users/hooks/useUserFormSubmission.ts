import { useCreateUser, useUpdateUser } from '../users.queries';
import type { CreateUserInput } from '../users.schemas';
import type { UserSummary } from '../users.types';

/** Escolhe entre criar e editar e avisa `onSaved` só quando a API confirma (ADR-042: o container fala com a API). */
export function useUserFormSubmission(user: UserSummary | null, onSaved: () => void) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const mutation = user ? updateUser : createUser;

  const submit = (input: CreateUserInput) => {
    if (user) {
      updateUser.mutate({ id: user.id, input }, { onSuccess: onSaved });
      return;
    }
    createUser.mutate(input, { onSuccess: onSaved });
  };

  return { submit, isSaving: mutation.isPending, apiError: mutation.error };
}
