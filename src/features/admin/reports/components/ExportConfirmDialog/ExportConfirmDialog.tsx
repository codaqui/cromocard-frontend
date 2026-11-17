import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';
import type { Period } from '@/components/PeriodFilter/PeriodFilter';
import { formatCount, formatPeriodRange } from '../../reports.period';

import { FORMAT_LABELS, periodLabel } from '../../reports.labels';
import type { ExportFormat, ReportPreview } from '../../reports.types';

interface ExportConfirmDialogProps {
  format: ExportFormat | null;
  preview?: ReportPreview;
  period: Period;
  isExporting: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function summaryOf(preview: ReportPreview, period: Period): string {
  const range = formatPeriodRange(preview.period.from, preview.period.to);
  const label = periodLabel(period, range);
  const when = label === range ? range : `${label} (${range})`;
  return `${preview.title} • ${when} • ${formatCount(preview.total)} registros.`;
}

export function ExportConfirmDialog({
  format,
  preview,
  period,
  isExporting,
  errorMessage,
  onConfirm,
  onCancel,
}: ExportConfirmDialogProps) {
  if (!format || !preview) return null;
  const formatLabel = FORMAT_LABELS[format];
  return (
    <ConfirmDialog
      open
      title={`Exportar o relatório em ${formatLabel}?`}
      message={summaryOf(preview, period)}
      confirmLabel={`Exportar ${formatLabel}`}
      isConfirming={isExporting}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
