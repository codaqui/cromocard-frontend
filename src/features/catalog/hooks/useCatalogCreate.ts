import { useState } from 'react';

import type { CatalogNotice } from '../catalog.types';
import type { CatalogCreateState } from '../components/CatalogCreateDialogs/CatalogCreateDialogs';
import type { CatalogCreateAction } from '../components/CatalogHeader/CatalogHeader';

export interface CatalogCreate extends CatalogCreateState {
  open: (action: CatalogCreateAction) => void;
  notify: (notice: CatalogNotice) => void;
}

export function useCatalogCreate(): CatalogCreate {
  const [action, setAction] = useState<CatalogCreateAction | null>(null);
  const [message, setMessage] = useState<CatalogNotice | null>(null);

  return {
    action,
    message,
    open: setAction,
    notify: setMessage,
    close: () => setAction(null),
    finish: (notice) => {
      setAction(null);
      setMessage(notice);
    },
    clearMessage: () => setMessage(null),
  };
}
