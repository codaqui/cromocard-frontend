import { type ChangeEvent, useState } from 'react';

import { importedCardsMessage } from '../catalog.labels';
import { useDownloadImportTemplate, useImportCards } from '../catalog.queries';

export function useCsvImport(onImported: (message: string) => void) {
  const [file, setFile] = useState<File | null>(null);
  const importing = useImportCards();
  const template = useDownloadImportTemplate();

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    importing.reset();
  };

  const submit = () => {
    if (!file) return;
    importing.mutate(file, {
      onSuccess: ({ created }) => onImported(importedCardsMessage(created)),
    });
  };

  return { file, selectFile, submit, importing, template };
}
