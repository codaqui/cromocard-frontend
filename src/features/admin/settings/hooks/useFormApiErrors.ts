import { useMemo } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { withFormFields } from '../settings.format';

export function useFormApiErrors<T extends FieldValues>(
  apiError: ApiError | null,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
) {
  const mapped = useMemo(() => withFormFields(apiError), [apiError]);
  return useApiFieldErrors(mapped, fields, setError);
}
