import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import { slugify } from '@/lib/slug';

import {
  type CategoryFormValues,
  type CategoryInput,
  categoryFormSchema,
} from '../catalog.schemas';
import { CATEGORY_TYPES, type Category, type CategoryType } from '../catalog.types';
import type { CatalogFormOptions } from './catalogFormOptions';
import { useReportInvalid } from './useReportInvalid';

function categoryTypeOf(value: string): CategoryType | undefined {
  return CATEGORY_TYPES.find((type) => type === value);
}

const categoryFields = ['name', 'type', 'parentCategoryId', 'description', 'badge'] as const;

function categoryFormDefaults(category?: Category): CategoryFormValues {
  return {
    name: category?.name ?? '',
    type: category?.type ?? '',
    parentCategoryId: category?.parentCategoryId ?? '',
    description: category?.description ?? '',
    badge: category?.badge ?? '',
  };
}

export function useCategoryForm({
  item: category,
  onSubmit,
  apiError,
  onInvalidChange,
}: CatalogFormOptions<Category, CategoryInput>) {
  const { register, control, handleSubmit, setError, setValue, formState } = useForm<
    CategoryFormValues,
    unknown,
    CategoryInput
  >({ resolver: zodResolver(categoryFormSchema), defaultValues: categoryFormDefaults(category) });

  const formError = useApiFieldErrors(apiError, categoryFields, setError);
  useReportInvalid(formState.errors, onInvalidChange);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  const type = categoryTypeOf(useWatch({ control, name: 'type' }));
  const name = useWatch({ control, name: 'name' });
  const slug = name.trim() ? slugify(name) : '';
  // Trocar o tipo invalida a categoria pai escolhida, que precisa ser do mesmo tipo.
  const registerType = () => register('type', { onChange: () => setValue('parentCategoryId', '') });

  return { register, registerType, type, slug, errors: formState.errors, formError, submit };
}
