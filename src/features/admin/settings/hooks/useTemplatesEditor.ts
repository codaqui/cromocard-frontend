import { useState } from 'react';

import { notifyFailure, type Notify } from './useSettingsNotice';
import { type SettingsNotice, settingsNotices } from '../settings.labels';
import { withTemplate } from '../settings.format';
import { useUpdateTemplates } from '../settings.queries';
import type { TemplateInput } from '../settings.schemas';
import type { NotificationTemplate } from '../settings.types';

type Persist = (
  templates: NotificationTemplate[],
  notice: SettingsNotice,
  onDone: () => void,
) => void;

function usePersistTemplates(notify: Notify) {
  const save = useUpdateTemplates();
  const persist: Persist = (templates, notice, onDone) =>
    save.mutate(templates, {
      onSuccess: () => {
        onDone();
        notify(notice);
      },
      onError: notifyFailure(notify),
    });
  return { persist, save };
}

function useTemplateEditing(
  templates: NotificationTemplate[],
  persist: Persist,
  reset: () => void,
) {
  const [editing, setEditing] = useState<{ index: number | null } | null>(null);
  const open = (index: number | null) => {
    reset();
    setEditing({ index });
  };
  const save = (input: TemplateInput) =>
    persist(
      withTemplate(templates, editing?.index ?? null, input),
      settingsNotices.templateSaved,
      () => setEditing(null),
    );

  return {
    editing,
    openNew: () => open(null),
    openEdit: open,
    close: () => setEditing(null),
    saveTemplate: save,
  };
}

function useTemplateDeletion(templates: NotificationTemplate[], persist: Persist) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const confirmDelete = () =>
    persist(
      templates.filter((_, position) => position !== deleting),
      settingsNotices.templateDeleted,
      () => setDeleting(null),
    );

  return { deleting, askDelete: setDeleting, cancelDelete: () => setDeleting(null), confirmDelete };
}

export function useTemplatesEditor(templates: NotificationTemplate[], notify: Notify) {
  const { persist, save } = usePersistTemplates(notify);

  return {
    ...useTemplateEditing(templates, persist, save.reset),
    ...useTemplateDeletion(templates, persist),
    isSaving: save.isPending,
    apiError: save.error,
  };
}
