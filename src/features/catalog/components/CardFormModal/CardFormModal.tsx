import { catalogItemTexts, formModalTextsOf } from '../../catalog.labels';
import { useSaveCard } from '../../catalog.queries';
import type { Card, CatalogNotice } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { CardForm } from '../CardForm/CardForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.card;

interface CardFormModalProps {
  card?: Card;
  onClose: () => void;
  onSaved: (notice: CatalogNotice) => void;
}

export function CardFormModal({ card, onClose, onSaved }: CardFormModalProps) {
  const save = useConfirmedSave(useSaveCard(card?.id), ({ name }) =>
    onSaved(card ? texts.updated(name) : texts.created(name)),
  );

  return (
    <CatalogFormModal
      texts={formModalTextsOf('card', card?.name)}
      size="large"
      save={save}
      onClose={onClose}
    >
      {(formId, reportInvalid) => (
        <CardForm
          formId={formId}
          card={card}
          apiError={save.apiError}
          onSubmit={save.review}
          onInvalidChange={reportInvalid}
        />
      )}
    </CatalogFormModal>
  );
}
