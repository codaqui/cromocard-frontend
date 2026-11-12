import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import type { ApiError } from '@/lib/api-error';

import { categoryTypeLabels } from '../../catalog.labels';
import type { CategoryInput } from '../../catalog.schemas';
import { CATEGORY_TYPES, type Category } from '../../catalog.types';
import { useCategoryForm } from '../../hooks/useCategoryForm';
import { useParentCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import styles from './CategoryForm.module.css';

const categoryTypeOptions = CATEGORY_TYPES.map((type) => ({
  value: type,
  label: categoryTypeLabels[type],
}));

interface CategoryFormProps {
  formId: string;
  category?: Category;
  apiError: ApiError | null;
  onSubmit: (input: CategoryInput) => void;
}

interface ParentCategoryFieldProps {
  category?: Category;
  error?: string;
  field: UseFormRegisterReturn<'parentCategoryId'>;
}

function ParentCategoryField({ category, error, field }: ParentCategoryFieldProps) {
  return (
    <IconSelect
      label="Categoria pai"
      icon="accountTree"
      placeholder="Sem categoria pai"
      options={useParentCategoryOptions(category)}
      error={error}
      {...field}
    />
  );
}

export function CategoryForm({ formId, category, apiError, onSubmit }: CategoryFormProps) {
  const { register, errors, formError, submit } = useCategoryForm(category, onSubmit, apiError);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <IconInput label="Nome" icon="title" error={errors.name?.message} {...register('name')} />
      <IconSelect
        label="Tipo"
        icon="category"
        placeholder="Escolha o tipo"
        options={categoryTypeOptions}
        error={errors.type?.message}
        {...register('type')}
      />
      <WideRow>
        <ParentCategoryField
          category={category}
          error={errors.parentCategoryId?.message}
          field={register('parentCategoryId')}
        />
        <FormError message={formError} />
      </WideRow>
    </form>
  );
}
