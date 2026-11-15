import { type ChangeEvent, type DragEvent, useState } from 'react';

import { csvDataRowsOf, importedCardsNotice } from '../catalog.format';
import { useDownloadImportTemplate, useImportCards } from '../catalog.queries';
import type { CatalogNotice } from '../catalog.types';

/** O arquivo escolhido e o total de linhas de cartas dele, lido no navegador. */
function useCsvFile(onChoose: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<number>();

  const choose = (next: File | null) => {
    setFile(next);
    setRows(undefined);
    onChoose();
    if (next) void next.text().then((text) => setRows(csvDataRowsOf(text)));
  };

  const selectFile = (event: ChangeEvent<HTMLInputElement>) =>
    choose(event.target.files?.[0] ?? null);

  const dropFile = (event: DragEvent) => {
    event.preventDefault();
    choose(event.dataTransfer.files[0] ?? null);
  };

  return { file, rows, choose, selectFile, dropFile };
}

export function useCsvImport(onImported: (notice: CatalogNotice) => void) {
  const importing = useImportCards();
  const template = useDownloadImportTemplate();
  const { file, rows, choose, ...picker } = useCsvFile(importing.reset);

  const submit = () => {
    if (!file) return;
    const onSuccess = ({ created }: { created: number }) =>
      onImported(importedCardsNotice(created, file.name));
    importing.mutate(file, { onSuccess });
  };

  return {
    file,
    rows,
    ...picker,
    restart: () => choose(null),
    submit,
    importing,
    template,
  };
}
