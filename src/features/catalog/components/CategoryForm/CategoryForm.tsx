import { FormError } from '@/components/FormError/FormError';
import type { ApiError } from '@/lib/api-error';

import { categoryBadgeLabels } from '../../catalog.labels';
import type { CategoryInput } from '../../catalog.schemas';
import { CATEGORY_BADGES, type Category } from '../../catalog.types';
import { useParentCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { useCategoryForm } from '../../hooks/useCategoryForm';
import { DescriptionField, IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import type { ReportInvalid } from '../CatalogFormModal/CatalogFormModal';
import styles from './CategoryForm.module.css';

const categoryBadgeOptions = CATEGORY_BADGES.map((badge) => ({
  value: badge,
  label: categoryBadgeLabels[badge],
}));

interface CategoryFormProps {
  formId: string;
  category?: Category;
  apiError: ApiError | null;
  onSubmit: (input: CategoryInput) => void;
  onInvalidChange?: ReportInvalid;
}

type CategoryFormState = ReturnType<typeof useCategoryForm>;

function ParentCategoryField({ form, category }: { form: CategoryFormState; category?: Category }) {
  return (
    <IconSelect
      label="Categoria pai"
      placeholder="Nenhuma"
      options={useParentCategoryOptions(category)}
      error={form.errors.parentCategoryId?.message}
      {...form.register('parentCategoryId')}
    />
  );
}

function DisplayFields({ form }: { form: CategoryFormState }) {
  return (
    <>
      <IconSelect
        label="Selo de exibição"
        placeholder="Nenhum"
        options={categoryBadgeOptions}
        error={form.errors.badge?.message}
        {...form.register('badge')}
      />
      <IconInput label="Slug" readOnly value={form.slug} />
    </>
  );
}

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
      <WideRow>
        <ParentCategoryField form={form} category={category} />
      </WideRow>
      <DisplayFields form={form} />
      <DescriptionField error={errors.description?.message} {...register('description')} />
      <WideRow>
        <FormError message={form.formError} />
      </WideRow>
    </form>
  );
}
