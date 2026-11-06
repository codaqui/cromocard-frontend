import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type AlbumFormValues, type AlbumInput, albumFormSchema } from '../catalog.schemas';
import type { Album } from '../catalog.types';

const albumFields = [
  'title',
  'publisher',
  'year',
  'description',
  'coverUrl',
  'categoryId',
] as const;

function albumFormDefaults(album?: Album): AlbumFormValues {
  return {
    title: album?.title ?? '',
    publisher: album?.publisher ?? '',
    year: album?.year ? String(album.year) : '',
    description: album?.description ?? '',
    coverUrl: album?.coverUrl ?? '',
    categoryId: album?.categoryId ?? '',
  };
}

export function useAlbumForm(
  album: Album | undefined,
  onSubmit: (input: AlbumInput) => void,
  apiError: ApiError | null,
) {
  const { register, control, handleSubmit, setError, formState } = useForm<
    AlbumFormValues,
    unknown,
    AlbumInput
  >({ resolver: zodResolver(albumFormSchema), defaultValues: albumFormDefaults(album) });

  const formError = useApiFieldErrors(apiError, albumFields, setError);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, control, errors: formState.errors, formError, submit };
}
