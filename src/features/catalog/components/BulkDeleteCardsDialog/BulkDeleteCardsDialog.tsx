import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { bulkDeletedNotice, bulkDeleteMessage, bulkDeleteTitle } from '../../catalog.format';
import { useBulkDeleteCards } from '../../catalog.queries';
import type { Card, CatalogNotice } from '../../catalog.types';

interface BulkDeleteCardsDialogProps {
  cards: Card[];
  onClose: () => void;
  onDeleted: (notice: CatalogNotice) => void;
}

const dialogLook = {
  cancelLabel: 'Voltar',
  tone: 'danger',
  variant: 'compact',
  plainReasonLabel: true,
  requireReason: true,
  reasonLabel: 'Motivo (obrigatório)',
} as const;

export function BulkDeleteCardsDialog({ cards, onClose, onDeleted }: BulkDeleteCardsDialogProps) {
  const removal = useBulkDeleteCards();
  const title = bulkDeleteTitle(cards.length);
  const confirm = (reason = '') =>
    removal.mutate(
      { ids: cards.map(({ id }) => id), reason },
      { onSuccess: (result) => onDeleted(bulkDeletedNotice(result)) },
    );

  return (
    <ConfirmDialog
      open
      title={`${title}?`}
      message={bulkDeleteMessage(cards.map(({ name }) => name))}
      confirmLabel={title}
      {...dialogLook}
      isConfirming={removal.isPending}
      errorMessage={removal.error?.message}
      onConfirm={confirm}
      onCancel={onClose}
    />
  );
}
