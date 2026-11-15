import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import type { ApiError } from '@/lib/api-error';

import { categoryTypeLabels } from '../../catalog.labels';
import type { CategoryInput } from '../../catalog.schemas';
import { CATEGORY_TYPES, type Category, type CategoryType } from '../../catalog.types';
import { useParentCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { useCategoryForm } from '../../hooks/useCategoryForm';
import { DescriptionField, IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import type { ReportInvalid } from '../CatalogFormModal/CatalogFormModal';
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
  onInvalidChange?: ReportInvalid;
}

interface ParentCategoryFieldProps {
  type?: CategoryType;
  category?: Category;
  error?: string;
  field: UseFormRegisterReturn<'parentCategoryId'>;
}

function ParentCategoryField({ type, category, error, field }: ParentCategoryFieldProps) {
  return (
    <IconSelect
      label="Categoria pai"
      placeholder={type ? 'Nenhuma' : 'Escolha o tipo primeiro'}
      options={useParentCategoryOptions(type, category)}
      error={error}
      {...field}
      disabled={!type}
    />
  );
}

type CategoryFormState = ReturnType<typeof useCategoryForm>;

function HierarchyFields({ form, category }: { form: CategoryFormState; category?: Category }) {
  const { errors } = form;

  return (
    <>
      <IconSelect
        label="Tipo"
        required
        placeholder="Selecione"
        options={categoryTypeOptions}
        error={errors.type?.message}
        {...form.registerType()}
      />
      <ParentCategoryField
        type={form.type}
        category={category}
        error={errors.parentCategoryId?.message}
        field={form.register('parentCategoryId')}
      />
    </>
  );
}

/** Nome, tipo, categoria pai e descrição, como no frame 833-10832 (slug e selo ficam para a CCD104). */
export function CategoryForm({ formId, category, ...options }: CategoryFormProps) {
  const form = useCategoryForm({ item: category, ...options });
  const { register, errors } = form;

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
      <WideRow>
        <IconInput
          label="Nome"
          required
          showValid
          error={errors.name?.message}
          {...register('name')}
        />
      </WideRow>
      <HierarchyFields form={form} category={category} />
      <DescriptionField error={errors.description?.message} {...register('description')} />
      <WideRow>
        <FormError message={form.formError} />
      </WideRow>
    </form>
  );
}
