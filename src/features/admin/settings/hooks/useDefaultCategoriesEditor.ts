import { useState } from 'react';

import type { Notify } from './useSettingsNotice';
import { errorNotice, imageFailureNotice, settingsNotices } from '../settings.labels';
import { useUpdateDefaultCategories, useUploadSettingImage } from '../settings.queries';
import { backImageSchema, imageErrorOf } from '../settings.schemas';
import type { CategoryOption, DefaultCategory } from '../settings.types';

function draftOf(
  { id, name, type, slug, badge, cardsCount }: CategoryOption,
  position: number,
): DefaultCategory {
  const emptyBack = { backImageUrl: null, isPinned: false, displayOrder: position };
  return { id, name, type, slug, badge, cardsCount, ...emptyBack };
}

export function useDefaultCategoriesDraft(initial: DefaultCategory[]) {
  const [draft, setDraft] = useState(initial);

  return {
    draft,
    add: (option: CategoryOption) =>
      setDraft((current) => [...current, draftOf(option, current.length)]),
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
        draft.map(({ id, backImageUrl, isPinned }) => ({ id, backImageUrl, isPinned })),
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
