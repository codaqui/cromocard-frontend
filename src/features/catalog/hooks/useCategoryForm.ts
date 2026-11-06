import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import {
  type CategoryFormValues,
  type CategoryInput,
  categoryFormSchema,
} from '../catalog.schemas';
import type { Category } from '../catalog.types';

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
) {
  const { register, handleSubmit, formState } = useForm<CategoryFormValues, unknown, CategoryInput>(
    { resolver: zodResolver(categoryFormSchema), defaultValues: categoryFormDefaults(category) },
  );

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit };
}
