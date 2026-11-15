import { type Control, Controller, type FieldPathByValue, type FieldValues } from 'react-hook-form';

import { ImageUploadField, type ImageUploadFieldProps } from '../ImageUploadField/ImageUploadField';

type FieldOptions = Omit<ImageUploadFieldProps, 'value' | 'onChange' | 'error'>;

interface ImageUploadControllerProps<
  TValues extends FieldValues,
  TOutput extends FieldValues,
> extends FieldOptions {
  control: Control<TValues, unknown, TOutput>;
  /** Só campos de texto: o valor do campo é a URL da imagem. */
  name: FieldPathByValue<TValues, string>;
}

export function ImageUploadController<TValues extends FieldValues, TOutput extends FieldValues>({
  control,
  name,
  ...options
}: ImageUploadControllerProps<TValues, TOutput>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ImageUploadField
          {...options}
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
