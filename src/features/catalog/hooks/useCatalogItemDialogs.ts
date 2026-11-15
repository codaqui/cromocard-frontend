import { useState } from 'react';

import type { CatalogItemRef, CatalogNotice } from '../catalog.types';

export interface CatalogItemDialogs<T> {
  form: { item?: T } | null;
  deleting: CatalogItemRef | null;
  openEdit: (item: T) => void;
  openDelete: (item: CatalogItemRef) => void;
  close: () => void;
  finish: (notice: CatalogNotice) => void;
}

export function useCatalogItemDialogs<T>(
  notify: (notice: CatalogNotice) => void,
): CatalogItemDialogs<T> {
  const [form, setForm] = useState<{ item?: T } | null>(null);
  const [deleting, setDeleting] = useState<CatalogItemRef | null>(null);

  const close = () => {
    setForm(null);
    setDeleting(null);
  };

  return {
    form,
    deleting,
    openEdit: (item) => setForm({ item }),
    openDelete: setDeleting,
    close,
    finish: (notice) => {
      close();
      notify(notice);
    },
  };
}
