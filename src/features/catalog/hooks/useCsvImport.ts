import { type ChangeEvent, useState } from 'react';

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

  return { file, rows, choose };
}

export function useCsvImport(onImported: (notice: CatalogNotice) => void) {
  const importing = useImportCards();
  const template = useDownloadImportTemplate();
  const { file, rows, choose } = useCsvFile(importing.reset);

  const submit = () => {
    if (!file) return;
    const onSuccess = ({ created }: { created: number }) =>
      onImported(importedCardsNotice(created, file.name));
    importing.mutate(file, { onSuccess });
  };

  const selectFile = (event: ChangeEvent<HTMLInputElement>) =>
    choose(event.target.files?.[0] ?? null);

  return { file, rows, selectFile, restart: () => choose(null), submit, importing, template };
}
