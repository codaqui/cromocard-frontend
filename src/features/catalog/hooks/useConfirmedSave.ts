import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiError } from '@/lib/api-error';

export interface ConfirmedSaveControls<TInput> {
  isReviewing: boolean;
  isSaving: boolean;
  apiError: ApiError | null;
  review: (input: TInput) => void;
  back: () => void;
  confirm: () => void;
}

export function useConfirmedSave<TInput>(
  mutation: UseMutationResult<unknown, Error, TInput>,
  onSaved: () => void,
): ConfirmedSaveControls<TInput> {
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
    apiError: mutation.error instanceof ApiError ? mutation.error : null,
    review,
    back: () => setPending(null),
    confirm,
  };
}
