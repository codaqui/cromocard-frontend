import { Button } from '@/components/Button/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import { Modal } from '@/components/Modal/Modal';
import { ApiError } from '@/lib/api-error';

import { catalogItemTexts } from '../../catalog.labels';
import { useDeleteCatalogItem } from '../../catalog.queries';
import type { CatalogItemRef, CatalogNotice } from '../../catalog.types';
import styles from './DeleteCatalogItemDialog.module.css';

/** Erros da API para itens com vínculos que impedem a exclusão (R11, L2). */
const BLOCKING_CODES = new Set(['CARD_IN_USE', 'ALBUM_HAS_CARDS', 'CATEGORY_IN_USE']);

function isBlocked(error: Error | null): boolean {
  return error instanceof ApiError && BLOCKING_CODES.has(error.code);
}

interface DeleteCatalogItemDialogProps {
  item: CatalogItemRef;
  onClose: () => void;
  onDeleted: (notice: CatalogNotice) => void;
}

/** Modal "Não é possível excluir esta carta", do frame 832-2217. */
function BlockedDeletionDialog({ item, onClose }: Omit<DeleteCatalogItemDialogProps, 'onDeleted'>) {
  const texts = catalogItemTexts[item.kind];

  return (
    <Modal
      open
      role="alertdialog"
      variant="compact"
      title={texts.blockedTitle}
      onClose={onClose}
      footer={<Button onClick={onClose}>Entendi</Button>}
    >
      <p className={styles.message}>{texts.blockedMessage(item.name)}</p>
    </Modal>
  );
}

export function DeleteCatalogItemDialog({
  item,
  onClose,
  onDeleted,
}: DeleteCatalogItemDialogProps) {
  const removal = useDeleteCatalogItem();
  const texts = catalogItemTexts[item.kind];

  if (isBlocked(removal.error)) return <BlockedDeletionDialog item={item} onClose={onClose} />;

  return (
    <ConfirmDialog
      open
      title={texts.deleteTitle}
      message={`Excluir "${item.name}" do catálogo?`}
      confirmLabel="Excluir"
      tone="danger"
      isConfirming={removal.isPending}
      errorMessage={removal.error?.message}
      onConfirm={() =>
        removal.mutate(item, { onSuccess: () => onDeleted(texts.deleted(item.name)) })
      }
      onCancel={onClose}
    />
  );
}
