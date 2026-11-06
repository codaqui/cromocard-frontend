import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';

export interface ConfirmedSaveControls {
  isReviewing: boolean;
  isSaving: boolean;
  errorMessage?: string;
  back: () => void;
  confirm: () => void;
}

export function useConfirmedSave<TInput>(
  mutation: UseMutationResult<unknown, Error, TInput>,
  onSaved: () => void,
) {
  const [pending, setPending] = useState<{ input: TInput } | null>(null);

  const review = (input: TInput) => {
    mutation.reset();
    setPending({ input });
  };

  const confirm = () => {
    if (!pending) return;
    mutation.mutate(pending.input, { onSuccess: onSaved, onSettled: () => setPending(null) });
  };

  return {
    isReviewing: pending !== null,
    isSaving: mutation.isPending,
    errorMessage: mutation.error?.message,
    review,
    back: () => setPending(null),
    confirm,
  };
}
