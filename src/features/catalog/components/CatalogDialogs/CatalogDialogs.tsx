import type { ReactNode } from 'react';

import type { CatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { DeleteCatalogItemDialog } from '../DeleteCatalogItemDialog/DeleteCatalogItemDialog';

interface CatalogDialogsProps<T> {
  dialogs: CatalogItemDialogs<T>;
  renderForm: (item: T | undefined) => ReactNode;
}

export function CatalogDialogs<T>({ dialogs, renderForm }: CatalogDialogsProps<T>) {
  return (
    <>
      {dialogs.form && renderForm(dialogs.form.item)}
      {dialogs.deleting && (
        <DeleteCatalogItemDialog
          item={dialogs.deleting}
          onClose={dialogs.close}
          onDeleted={dialogs.finish}
        />
      )}
    </>
  );
}
