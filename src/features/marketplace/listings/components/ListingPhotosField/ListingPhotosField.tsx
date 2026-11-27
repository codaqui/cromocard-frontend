import { type ChangeEvent, type DragEvent, useId, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { PHOTO_REJECTED_MESSAGE, photoSlotLabelOf } from '../../listings.labels';
import {
  ACCEPTED_PHOTO_TYPES,
  isAcceptedPhoto,
  photoSlotCount,
  withoutPhotoAt,
  withPhotoAt,
} from '../../listings.photos';
import { useUploadListingPhoto } from '../../listings.queries';
import styles from './ListingPhotosField.module.css';

interface ListingPhotosFieldProps {
  value: string[];
  onChange: (photoUrls: string[]) => void;
}

interface PhotoSlotProps {
  index: number;
  url?: string;
  onUpload: (index: number, url: string) => void;
  onRemove: (index: number) => void;
  onReject: (message: string | null) => void;
}

const allowDrop = (event: DragEvent) => event.preventDefault();

const slotLabelOf = photoSlotLabelOf;

function usePhotoUpload({ index, onUpload, onReject }: PhotoSlotProps) {
  const upload = useUploadListingPhoto();

  const send = (file?: File) => {
    if (!file) return;
    if (!isAcceptedPhoto(file)) return onReject(PHOTO_REJECTED_MESSAGE);
    onReject(null);
    upload.mutate(file, {
      onSuccess: ({ url }) => onUpload(index, url),
      onError: (error) => onReject(error.message),
    });
  };

  return {
    isPending: upload.isPending,
    select: (event: ChangeEvent<HTMLInputElement>) => send(event.target.files?.[0]),
    drop: (event: DragEvent) => {
      event.preventDefault();
      send(event.dataTransfer.files[0]);
    },
  };
}

type PhotoUpload = ReturnType<typeof usePhotoUpload>;

function SlotStatus({
  index,
  url,
  isPending,
}: {
  index: number;
  url?: string;
  isPending: boolean;
}) {
  if (isPending) return <span className={styles.hint}>Enviando a foto…</span>;
  if (!url) return <span className={styles.hint}>Arraste ou clique para enviar</span>;
  return (
    <span className={styles.loaded}>
      <Icon name="check" size={12} />
      Foto {index + 1} Carregada
    </span>
  );
}

function SlotPicker({ slot, upload }: { slot: PhotoSlotProps; upload: PhotoUpload }) {
  const label = slotLabelOf(slot.index);

  return (
    <label className={styles.picker}>
      <Icon name="cloudUpload" size={22} />
      <strong className={styles.title}>{label}</strong>
      <SlotStatus index={slot.index} url={slot.url} isPending={upload.isPending} />
      <input
        type="file"
        className={styles.hiddenInput}
        accept={ACCEPTED_PHOTO_TYPES}
        aria-label={`Enviar ${label}`}
        disabled={upload.isPending}
        onChange={upload.select}
      />
    </label>
  );
}

function PhotoSlot(slot: PhotoSlotProps) {
  const upload = usePhotoUpload(slot);

  return (
    <div
      className={cn(styles.slot, slot.url && styles.filled)}
      onDragOver={allowDrop}
      onDrop={upload.drop}
    >
      <SlotPicker slot={slot} upload={upload} />
      {slot.url && (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remover ${slotLabelOf(slot.index)}`}
          onClick={() => slot.onRemove(slot.index)}
        >
          <Icon name="delete" size={16} />
        </button>
      )}
    </div>
  );
}

function PhotoSlots({
  value,
  onChange,
  onReject,
}: ListingPhotosFieldProps & Pick<PhotoSlotProps, 'onReject'>) {
  const slots = Array.from({ length: photoSlotCount(value.length) }, (_, index) => index);

  return (
    <div className={styles.grid}>
      {slots.map((index) => (
        <PhotoSlot
          key={index}
          index={index}
          url={value[index]}
          onUpload={(position, url) => onChange(withPhotoAt(value, position, url))}
          onRemove={(position) => onChange(withoutPhotoAt(value, position))}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

export function ListingPhotosField(props: ListingPhotosFieldProps) {
  const labelId = useId();
  const [rejection, setRejection] = useState<string | null>(null);

  return (
    <div className={styles.field} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        Fotos (opcional, até 4)
      </span>
      <PhotoSlots {...props} onReject={setRejection} />
      {rejection && (
        <span className={styles.error} role="alert">
          {rejection}
        </span>
      )}
    </div>
  );
}
