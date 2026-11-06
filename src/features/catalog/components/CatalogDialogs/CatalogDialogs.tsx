import type { ReactNode } from 'react';

import { Button } from '@/components/Button/Button';
import { Toast } from '@/components/Toast/Toast';

import type { CatalogItemDialogs } from '../../hooks/useCatalogItemDialogs';
import { DeleteCatalogItemDialog } from '../DeleteCatalogItemDialog/DeleteCatalogItemDialog';
import styles from './CatalogDialogs.module.css';

interface CatalogDialogsProps<T> {
  createLabel: string;
  dialogs: CatalogItemDialogs<T>;
  renderForm: (item: T | undefined) => ReactNode;
}

export function CatalogDialogs<T>({ createLabel, dialogs, renderForm }: CatalogDialogsProps<T>) {
  return (
    <>
      <Button className={styles.create} onClick={dialogs.openCreate}>
        {createLabel}
      </Button>
      {dialogs.form && renderForm(dialogs.form.item)}
      {dialogs.deleting && (
        <DeleteCatalogItemDialog
          item={dialogs.deleting}
          onClose={dialogs.close}
          onDeleted={dialogs.finish}
        />
      )}
      <Toast message={dialogs.message} onDismiss={dialogs.clearMessage} />
    </>
  );
}
