import { useState } from 'react';

import { notifyFailure, type Notify } from './useSettingsNotice';
import { type SettingsNotice, settingsNotices } from '../settings.labels';
import { positionOf, type TemplateRef, templateRefOf, withTemplate } from '../settings.format';
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
  const [target, setTarget] = useState<{ ref: TemplateRef | null } | null>(null);
  const editing = target && { index: target.ref ? positionOf(templates, target.ref) : null };
  const open = (index: number | null) => {
    reset();
    setTarget({ ref: index === null ? null : templateRefOf(templates, index) });
  };
  const save = (input: TemplateInput) =>
    persist(
      withTemplate(templates, editing?.index ?? null, input),
      settingsNotices.templateSaved,
      () => setTarget(null),
    );

  return {
    editing,
    openNew: () => open(null),
    openEdit: open,
    close: () => setTarget(null),
    saveTemplate: save,
  };
}

function useTemplateDeletion(templates: NotificationTemplate[], persist: Persist) {
  const [ref, setRef] = useState<TemplateRef | null>(null);
  const deleting = ref && positionOf(templates, ref);
  const confirmDelete = () =>
    persist(
      templates.filter((_, position) => position !== deleting),
      settingsNotices.templateDeleted,
      () => setRef(null),
    );
  const askDelete = (index: number) => setRef(templateRefOf(templates, index));

  return { deleting, askDelete, cancelDelete: () => setRef(null), confirmDelete };
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
