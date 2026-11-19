import { catalogItemTexts, duplicateModalTextsOf, formModalTextsOf } from '../../catalog.labels';
import { useSaveCard } from '../../catalog.queries';
import type { Card, CatalogNotice } from '../../catalog.types';
import { duplicateOf } from '../../hooks/useCardForm';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { CardForm } from '../CardForm/CardForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.card;

interface CardFormModalProps {
  card?: Card;
  /** Carta de origem: abre o "Duplicar carta", que cadastra uma carta nova (CCD105). */
  source?: Card;
  onClose: () => void;
  onSaved: (notice: CatalogNotice) => void;
}

function modalTextsOf({ card, source }: Pick<CardFormModalProps, 'card' | 'source'>) {
  return source ? duplicateModalTextsOf(source.name) : formModalTextsOf('card', card?.name);
}

export function CardFormModal({ card, source, onClose, onSaved }: CardFormModalProps) {
  const save = useConfirmedSave(useSaveCard(card?.id), ({ name }) =>
    onSaved(card ? texts.updated(name) : texts.created(name)),
  );

  return (
    <CatalogFormModal
      texts={modalTextsOf({ card, source })}
      size="large"
      save={save}
      onClose={onClose}
    >
      {(formId, reportInvalid) => (
        <CardForm
          formId={formId}
          card={source ? duplicateOf(source) : card}
          apiError={save.apiError}
          onSubmit={save.review}
          onInvalidChange={reportInvalid}
        />
      )}
    </CatalogFormModal>
  );
}
