import { catalogItemTexts } from '../../catalog.labels';
import { useSaveCard } from '../../catalog.queries';
import type { Card } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { CardForm } from '../CardForm/CardForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.card;

interface CardFormModalProps {
  card?: Card;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function CardFormModal({ card, onClose, onSaved }: CardFormModalProps) {
  const save = useConfirmedSave(useSaveCard(card?.id), () =>
    onSaved(card ? texts.updated : texts.created),
  );

  return (
    <CatalogFormModal
      title={card ? texts.editTitle : texts.createTitle}
      confirmMessage={texts.confirmSave}
      save={save}
      onClose={onClose}
    >
      {(formId) => (
        <CardForm formId={formId} card={card} apiError={save.apiError} onSubmit={save.review} />
      )}
    </CatalogFormModal>
  );
}
