import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

import type { UploadFolder } from '../../catalog.types';
import { ImageUploadField } from '../ImageUploadField/ImageUploadField';

interface ImageUploadControllerProps<TValues extends FieldValues, TOutput extends FieldValues> {
  control: Control<TValues, unknown, TOutput>;
  name: Path<TValues>;
  label: string;
  folder: UploadFolder;
  removable?: boolean;
}

export function ImageUploadController<TValues extends FieldValues, TOutput extends FieldValues>({
  control,
  name,
  label,
  folder,
  removable,
}: ImageUploadControllerProps<TValues, TOutput>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ImageUploadField
          label={label}
          folder={folder}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          error={fieldState.error?.message}
          removable={removable}
        />
      )}
    />
  );
}
