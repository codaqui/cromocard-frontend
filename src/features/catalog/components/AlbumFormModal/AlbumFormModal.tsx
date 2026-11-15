import { catalogItemTexts, formModalTextsOf } from '../../catalog.labels';
import { useSaveAlbum } from '../../catalog.queries';
import type { Album, CatalogNotice } from '../../catalog.types';
import { useConfirmedSave } from '../../hooks/useConfirmedSave';
import { AlbumForm } from '../AlbumForm/AlbumForm';
import { CatalogFormModal } from '../CatalogFormModal/CatalogFormModal';

const texts = catalogItemTexts.album;

interface AlbumFormModalProps {
  album?: Album;
  onClose: () => void;
  onSaved: (notice: CatalogNotice) => void;
}

export function AlbumFormModal({ album, onClose, onSaved }: AlbumFormModalProps) {
  const save = useConfirmedSave(useSaveAlbum(album?.id), ({ title }) =>
    onSaved(album ? texts.updated(title) : texts.created(title)),
  );

  return (
    <CatalogFormModal
      texts={formModalTextsOf('album', album?.title)}
      size="large"
      save={save}
      onClose={onClose}
    >
      {(formId, reportInvalid) => (
        <AlbumForm
          formId={formId}
          album={album}
          apiError={save.apiError}
          onSubmit={save.review}
          onInvalidChange={reportInvalid}
        />
      )}
    </CatalogFormModal>
  );
}
