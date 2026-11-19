import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { bulkDeletedNotice, bulkDeleteMessage, bulkDeleteTitle } from '../../catalog.format';
import { useBulkDeleteCards } from '../../catalog.queries';
import type { Card, CatalogNotice } from '../../catalog.types';

interface BulkDeleteCardsDialogProps {
  cards: Card[];
  onClose: () => void;
  onDeleted: (notice: CatalogNotice) => void;
}

/** Modal "Excluir 3 cartas?" do frame 832-4908, com o motivo obrigatório (CCD105, R10). */
export function BulkDeleteCardsDialog({ cards, onClose, onDeleted }: BulkDeleteCardsDialogProps) {
  const removal = useBulkDeleteCards();
  const title = bulkDeleteTitle(cards.length);
  const confirm = (reason?: string) =>
    removal.mutate(
      { ids: cards.map(({ id }) => id), reason: reason ?? '' },
      { onSuccess: (result) => onDeleted(bulkDeletedNotice(result)) },
    );

  return (
    <ConfirmDialog
      open
      title={`${title}?`}
      message={bulkDeleteMessage(cards.map(({ name }) => name))}
      confirmLabel={title}
      cancelLabel="Voltar"
      tone="danger"
      requireReason
      reasonLabel="Motivo (obrigatório)"
      isConfirming={removal.isPending}
      errorMessage={removal.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}
