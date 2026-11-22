import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { exportCode, exportPeriodLabel, reportTitle } from '../../reports.history';
import { reportsMessages } from '../../reports.labels';
import type { ReportExport } from '../../reports.types';

interface ExpiredExportDialogProps {
  item: ReportExport | null;
  isRegenerating: boolean;
  errorMessage?: string;
  onRegenerate: (item: ReportExport) => void;
  onClose: () => void;
}

function detailOf(item: ReportExport): string {
  const period = exportPeriodLabel(item).toLowerCase();
  const report = `${reportTitle(item.type)}, ${period}`;
  return reportsMessages.expiredDetail(exportCode(item.id), report);
}

export function ExpiredExportDialog({
  item,
  isRegenerating,
  errorMessage,
  onRegenerate,
  onClose,
}: ExpiredExportDialogProps) {
  if (!item) return null;
  return (
    <ConfirmDialog
      open
      title={reportsMessages.expiredTitle}
      message={detailOf(item)}
      confirmLabel="Gerar de novo"
      cancelLabel="Fechar"
      isConfirming={isRegenerating}
      errorMessage={errorMessage}
      onConfirm={() => onRegenerate(item)}
      onCancel={onClose}
    />
  );
}
