import { catalogItemTexts, formModalTextsOf } from '../../catalog.labels';
import { useSaveCategory } from '../../catalog.queries';
import type { Category, CatalogNotice } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { CategoryForm } from '../CategoryForm/CategoryForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.category;

interface CategoryFormModalProps {
  category?: Category;
  onClose: () => void;
  onSaved: (notice: CatalogNotice) => void;
}

export function CategoryFormModal({ category, onClose, onSaved }: CategoryFormModalProps) {
  const save = useConfirmedSave(useSaveCategory(category?.id), ({ name }) =>
    onSaved(category ? texts.updated(name) : texts.created(name)),
  );

  return (
    <CatalogFormModal
      texts={formModalTextsOf('category', category?.name)}
      save={save}
      onClose={onClose}
    >
      {(formId, reportInvalid) => (
        <CategoryForm
          formId={formId}
          category={category}
          apiError={save.apiError}
          onSubmit={save.review}
          onInvalidChange={reportInvalid}
        />
      )}
    </CatalogFormModal>
  );
}
