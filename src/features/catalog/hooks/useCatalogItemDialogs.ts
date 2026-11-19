import { useState } from 'react';

import type { CatalogItemRef, CatalogNotice } from '../catalog.types';

/** `item` edita um item existente; `source` cadastra um novo a partir de outro (CCD105). */
export interface CatalogFormTarget<T> {
  item?: T;
  source?: T;
}

export interface CatalogItemDialogs<T> {
  form: CatalogFormTarget<T> | null;
  deleting: CatalogItemRef | null;
  openEdit: (item: T) => void;
  openDuplicate: (source: T) => void;
  openDelete: (item: CatalogItemRef) => void;
  close: () => void;
  finish: (notice: CatalogNotice) => void;
}

export function useCatalogItemDialogs<T>(
  notify: (notice: CatalogNotice) => void,
): CatalogItemDialogs<T> {
  const [form, setForm] = useState<CatalogFormTarget<T> | null>(null);
  const [deleting, setDeleting] = useState<CatalogItemRef | null>(null);

  const close = () => {
    setForm(null);
    setDeleting(null);
  };

  return {
    form,
    deleting,
    openEdit: (item) => setForm({ item }),
    openDuplicate: (source) => setForm({ source }),
    openDelete: setDeleting,
    close,
    finish: (notice) => {
      close();
      notify(notice);
    },
  };
}
