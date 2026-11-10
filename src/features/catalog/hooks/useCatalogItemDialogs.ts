import { useState } from 'react';

import type { CatalogItemRef } from '../catalog.types';

export interface CatalogItemDialogs<T> {
  form: { item?: T } | null;
  deleting: CatalogItemRef | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  openDelete: (item: CatalogItemRef) => void;
  close: () => void;
  finish: (message: string) => void;
}

export function useCatalogItemDialogs<T>(notify: (message: string) => void): CatalogItemDialogs<T> {
  const [form, setForm] = useState<{ item?: T } | null>(null);
  const [deleting, setDeleting] = useState<CatalogItemRef | null>(null);

  const close = () => {
    setForm(null);
    setDeleting(null);
  };

  return {
    form,
    deleting,
    openCreate: () => setForm({}),
    openEdit: (item) => setForm({ item }),
    openDelete: setDeleting,
    close,
    finish: (text) => {
      close();
      notify(text);
    },
  };
}
