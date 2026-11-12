import { Toast } from '@/components/Toast/Toast';

import type { CatalogCreateAction } from '../CatalogHeader/CatalogHeader';
import { AlbumFormModal } from '../AlbumFormModal/AlbumFormModal';
import { CardFormModal } from '../CardFormModal/CardFormModal';
import { ImportCsvModal } from '../ImportCsvModal/ImportCsvModal';

export interface CatalogCreateState {
  action: CatalogCreateAction | null;
  message: string | null;
  close: () => void;
  finish: (message: string) => void;
  clearMessage: () => void;
}

const dialogsByAction = {
  card: CardFormModal,
  album: AlbumFormModal,
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
      <Toast message={state.message} onDismiss={state.clearMessage} />
    </>
  );
}
