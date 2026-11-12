import { useState } from 'react';

import type { CatalogCreateState } from '../components/CatalogCreateDialogs/CatalogCreateDialogs';
import type { CatalogCreateAction } from '../components/CatalogHeader/CatalogHeader';

export interface CatalogCreate extends CatalogCreateState {
  open: (action: CatalogCreateAction) => void;
  notify: (message: string) => void;
}

export function useCatalogCreate(): CatalogCreate {
  const [action, setAction] = useState<CatalogCreateAction | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return {
    action,
    message,
    open: setAction,
    notify: setMessage,
    close: () => setAction(null),
    finish: (text) => {
      setAction(null);
      setMessage(text);
    },
    clearMessage: () => setMessage(null),
  };
}
