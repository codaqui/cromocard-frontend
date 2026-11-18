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
import type { Category } from '../catalog.types';
import type { CatalogFormOptions } from './catalogFormOptions';
import { useReportInvalid } from './useReportInvalid';

const categoryFields = ['name', 'parentCategoryId', 'description', 'badge'] as const;

function categoryFormDefaults(category?: Category): CategoryFormValues {
  return {
    name: category?.name ?? '',
    parentCategoryId: category?.parentCategoryId ?? '',
    description: category?.description ?? '',
    badge: category?.badge ?? '',
  };
}

function slugOf(name: string, category?: Category): string {
  if (category?.slug && name === category.name) return category.slug;
  return name.trim() ? slugify(name) : '';
}

export function useCategoryForm({
  item: category,
  onSubmit,
  apiError,
  onInvalidChange,
}: CatalogFormOptions<Category, CategoryInput>) {
  const { register, control, handleSubmit, setError, formState } = useForm<
    CategoryFormValues,
    unknown,
    CategoryInput
  >({ resolver: zodResolver(categoryFormSchema), defaultValues: categoryFormDefaults(category) });

  const formError = useApiFieldErrors(apiError, categoryFields, setError);
  useReportInvalid(formState.errors, onInvalidChange);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  const name = useWatch({ control, name: 'name' });
  const slug = slugOf(name, category);

  return { register, slug, errors: formState.errors, formError, submit };
}
