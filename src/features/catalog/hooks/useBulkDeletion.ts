import { useState } from 'react';

import type { CatalogNotice } from '../catalog.types';
import type { CardSelection } from './useCardSelection';

export interface BulkDeletion {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  finish: (notice: CatalogNotice) => void;
}

export function useBulkDeletion(
  selection: CardSelection,
  notify: (notice: CatalogNotice) => void,
): BulkDeletion {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    finish: (notice) => {
      setIsOpen(false);
      selection.clear();
      notify(notice);
    },
  };
}
