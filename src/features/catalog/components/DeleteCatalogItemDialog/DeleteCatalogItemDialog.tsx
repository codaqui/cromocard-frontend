import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { catalogItemTexts } from '../../catalog.labels';
import { useDeleteCatalogItem } from '../../catalog.queries';
import type { CatalogItemRef } from '../../catalog.types';

interface DeleteCatalogItemDialogProps {
  item: CatalogItemRef;
  onClose: () => void;
  onDeleted: (message: string) => void;
}

export function DeleteCatalogItemDialog({
  item,
  onClose,
  onDeleted,
}: DeleteCatalogItemDialogProps) {
  const removal = useDeleteCatalogItem();
  const texts = catalogItemTexts[item.kind];

  return (
    <ConfirmDialog
      open
      title={texts.deleteTitle}
      message={`Excluir "${item.name}" do catálogo?`}
      confirmLabel="Excluir"
      tone="danger"
      isConfirming={removal.isPending}
      errorMessage={removal.error?.message}
      onConfirm={() => removal.mutate(item, { onSuccess: () => onDeleted(texts.deleted) })}
      onCancel={onClose}
    />
  );
}
