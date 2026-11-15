import { Toast } from '@/components/Toast/Toast';

import type { CatalogNotice } from '../../catalog.types';
import type { CatalogCreateAction } from '../CatalogHeader/CatalogHeader';
import { AlbumFormModal } from '../AlbumFormModal/AlbumFormModal';
import { CardFormModal } from '../CardFormModal/CardFormModal';
import { CategoryFormModal } from '../CategoryFormModal/CategoryFormModal';
import { ImportCsvModal } from '../ImportCsvModal/ImportCsvModal';

export interface CatalogCreateState {
  action: CatalogCreateAction | null;
  message: CatalogNotice | null;
  close: () => void;
  finish: (notice: CatalogNotice) => void;
  clearMessage: () => void;
}

const dialogsByAction = {
  card: CardFormModal,
  album: AlbumFormModal,
  category: CategoryFormModal,
} as const;

function CreateDialog({ state }: { state: CatalogCreateState }) {
  if (state.action === 'import') {
    return <ImportCsvModal onClose={state.close} onImported={state.finish} />;
  }
  if (!state.action) return null;

  const Dialog = dialogsByAction[state.action];
  return <Dialog onClose={state.close} onSaved={state.finish} />;
}

export function CatalogCreateDialogs({ state }: { state: CatalogCreateState }) {
  return (
    <>
      <CreateDialog state={state} />
      <Toast
        message={state.message?.title ?? null}
        detail={state.message?.detail}
        placement="top"
        onDismiss={state.clearMessage}
      />
    </>
  );
}
