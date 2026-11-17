import { useState } from 'react';

import type { Notify } from './useSettingsNotice';
import { errorNotice, imageFailureNotice, settingsNotices } from '../settings.labels';
import { useUpdateDefaultCategories, useUploadSettingImage } from '../settings.queries';
import { backImageSchema, imageErrorOf } from '../settings.schemas';
import type { CategoryOption, DefaultCategory } from '../settings.types';

export function useDefaultCategoriesDraft(initial: DefaultCategory[]) {
  const [draft, setDraft] = useState(initial);

  return {
    draft,
    add: ({ id, name, type }: CategoryOption) =>
      setDraft((current) => [...current, { id, name, type, backImageUrl: null }]),
    remove: (id: string) => setDraft((current) => current.filter((category) => category.id !== id)),
    setBack: (id: string, backImageUrl: string) =>
      setDraft((current) =>
        current.map((category) => (category.id === id ? { ...category, backImageUrl } : category)),
      ),
    reset: () => setDraft(initial),
  };
}

export function useSaveDefaultCategories(notify: Notify) {
  const save = useUpdateDefaultCategories();

  return {
    isSaving: save.isPending,
    save: (draft: DefaultCategory[]) =>
      save.mutate(
        draft.map(({ id, backImageUrl }) => ({ id, backImageUrl })),
        {
          onSuccess: () => notify(settingsNotices.defaultCategories),
          onError: (error) => notify(errorNotice(error)),
        },
      ),
  };
}

export function useBackImageUpload(onUploaded: (id: string, url: string) => void, notify: Notify) {
  const upload = useUploadSettingImage('cards');
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const choose = (id: string, file: File) => {
    const invalid = imageErrorOf(backImageSchema, file);
    if (invalid) return notify(imageFailureNotice(invalid));
    setUploadingId(id);
    upload.mutate(file, {
      onSuccess: ({ url }) => onUploaded(id, url),
      onError: (error) => notify(imageFailureNotice(error.message)),
      onSettled: () => setUploadingId(null),
    });
  };

  return { choose, uploadingId };
}
