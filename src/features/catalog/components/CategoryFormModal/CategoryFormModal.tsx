import { catalogItemTexts } from '../../catalog.labels';
import { useSaveCategory } from '../../catalog.queries';
import type { Category } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { CategoryForm } from '../CategoryForm/CategoryForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.category;

interface CategoryFormModalProps {
  category?: Category;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function CategoryFormModal({ category, onClose, onSaved }: CategoryFormModalProps) {
  const save = useConfirmedSave(useSaveCategory(category?.id), () =>
    onSaved(category ? texts.updated : texts.created),
  );

  return (
    <CatalogFormModal
      title={category ? texts.editTitle : texts.createTitle}
      confirmMessage={texts.confirmSave}
      save={save}
      onClose={onClose}
    >
      {(formId) => (
        <CategoryForm
          formId={formId}
          category={category}
          apiError={save.apiError}
          onSubmit={save.review}
        />
      )}
    </CatalogFormModal>
  );
}
