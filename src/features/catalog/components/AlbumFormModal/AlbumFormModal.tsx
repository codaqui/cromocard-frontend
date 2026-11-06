import { catalogItemTexts } from '../../catalog.labels';
import { useSaveAlbum } from '../../catalog.queries';
import type { Album } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { AlbumForm } from '../AlbumForm/AlbumForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.album;

interface AlbumFormModalProps {
  album?: Album;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function AlbumFormModal({ album, onClose, onSaved }: AlbumFormModalProps) {
  const save = useConfirmedSave(useSaveAlbum(album?.id), () =>
    onSaved(album ? texts.updated : texts.created),
  );

  return (
    <CatalogFormModal
      title={album ? texts.editTitle : texts.createTitle}
      confirmMessage={texts.confirmSave}
      save={save}
      onClose={onClose}
    >
      {(formId) => (
        <AlbumForm
          formId={formId}
          album={album}
          errorMessage={save.errorMessage}
          onSubmit={save.review}
        />
      )}
    </CatalogFormModal>
  );
}
