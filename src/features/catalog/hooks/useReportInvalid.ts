import { useEffect } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';

import type { ReportInvalid } from '../components/CatalogFormModal/CatalogFormModal';

/** Avisa ao modal quantos campos estão com erro, para o rodapé "Corrija os N campos destacados". */
export function useReportInvalid<T extends FieldValues>(
  errors: FieldErrors<T>,
  report?: ReportInvalid,
) {
  const count = Object.keys(errors).length;

  useEffect(() => {
    report?.(count);
  }, [count, report]);
}
