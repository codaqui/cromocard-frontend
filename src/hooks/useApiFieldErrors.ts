import { useEffect } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import type { ApiError, ApiErrorDetail } from '@/lib/api-error';

function detailsFor<T extends FieldValues>(apiError: ApiError | null, fields: readonly Path<T>[]) {
  return (apiError?.details ?? []).filter((detail): detail is ApiErrorDetail & { field: Path<T> } =>
    fields.includes(detail.field as Path<T>),
  );
}

/** `fields` precisa ser estável (constante do módulo), porque entra nas dependências do efeito. */
export function useApiFieldErrors<T extends FieldValues>(
  apiError: ApiError | null,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
): string | undefined {
  useEffect(() => {
    detailsFor(apiError, fields).forEach(({ field, message }) => setError(field, { message }));
  }, [apiError, fields, setError]);

  const hasFieldErrors = detailsFor(apiError, fields).length > 0;
  return apiError && !hasFieldErrors ? apiError.message : undefined;
}
