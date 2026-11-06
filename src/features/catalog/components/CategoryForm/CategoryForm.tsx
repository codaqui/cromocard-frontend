import { FormError } from '@/components/FormError/FormError';
import { Select } from '@/components/Select/Select';
import { TextField } from '@/components/TextField/TextField';

import { categoryTypeLabels } from '../../catalog.labels';
import type { CategoryInput } from '../../catalog.schemas';
import { CATEGORY_TYPES, type Category } from '../../catalog.types';
import { useCategoryForm } from '../../hooks/useCategoryForm';
import { useParentCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import styles from './CategoryForm.module.css';

const categoryTypeOptions = CATEGORY_TYPES.map((type) => ({
  value: type,
  label: categoryTypeLabels[type],
}));

interface CategoryFormProps {
  formId: string;
  category?: Category;
  errorMessage?: string;
  onSubmit: (input: CategoryInput) => void;
}

export function CategoryForm({ formId, category, errorMessage, onSubmit }: CategoryFormProps) {
  const { register, errors, submit } = useCategoryForm(category, onSubmit);
  const parentOptions = useParentCategoryOptions(category?.id);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <TextField label="Nome" error={errors.name?.message} {...register('name')} />
      <Select
        label="Tipo"
        placeholder="Escolha o tipo"
        options={categoryTypeOptions}
        error={errors.type?.message}
        {...register('type')}
      />
      <Select
        label="Categoria pai"
        placeholder="Sem categoria pai"
        options={parentOptions}
        error={errors.parentCategoryId?.message}
        {...register('parentCategoryId')}
      />
      <FormError message={errorMessage} />
    </form>
  );
}
