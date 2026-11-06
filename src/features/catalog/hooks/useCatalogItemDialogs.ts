import { useState } from 'react';

import type { CatalogItemRef } from '../catalog.types';

export interface CatalogItemDialogs<T> {
  form: { item?: T } | null;
  deleting: CatalogItemRef | null;
  message: string | null;
  openCreate: () => void;
  openEdit: (item: T) => void;
  openDelete: (item: CatalogItemRef) => void;
  close: () => void;
  finish: (message: string) => void;
  clearMessage: () => void;
}

export function useCatalogItemDialogs<T>(): CatalogItemDialogs<T> {
  const [form, setForm] = useState<{ item?: T } | null>(null);
  const [deleting, setDeleting] = useState<CatalogItemRef | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const close = () => {
    setForm(null);
    setDeleting(null);
  };

  return {
    form,
    deleting,
    message,
    openCreate: () => setForm({}),
    openEdit: (item) => setForm({ item }),
    openDelete: setDeleting,
    close,
    finish: (text) => {
      close();
      setMessage(text);
    },
    clearMessage: () => setMessage(null),
  };
}
