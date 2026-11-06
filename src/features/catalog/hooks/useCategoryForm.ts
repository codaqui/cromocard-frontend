import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import {
  type CategoryFormValues,
  type CategoryInput,
  categoryFormSchema,
} from '../catalog.schemas';
import type { Category } from '../catalog.types';

const categoryFields = ['name', 'type', 'parentCategoryId'] as const;

function categoryFormDefaults(category?: Category): CategoryFormValues {
  return {
    name: category?.name ?? '',
    type: category?.type ?? '',
    parentCategoryId: category?.parentCategoryId ?? '',
  };
}

export function useCategoryForm(
  category: Category | undefined,
  onSubmit: (input: CategoryInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, formState } = useForm<
    CategoryFormValues,
    unknown,
    CategoryInput
  >({ resolver: zodResolver(categoryFormSchema), defaultValues: categoryFormDefaults(category) });

  const formError = useApiFieldErrors(apiError, categoryFields, setError);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, formError, submit };
}
