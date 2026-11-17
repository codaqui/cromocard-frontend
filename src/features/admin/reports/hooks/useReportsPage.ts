import { useState } from 'react';

import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import { reportsMessages } from '../reports.labels';
import { DEFAULT_DASHBOARD_PERIOD, toPeriodParams } from '../reports.period';
import { useExportReport, useReportPreview } from '../reports.queries';
import type { ExportFormat, ReportPeriodParams, ReportType } from '../reports.types';

interface ExportTarget {
  title: string;
  period: { from: string; to: string };
}

function useExportToast() {
  const [toast, setToast] = useState<string | null>(null);
  return {
    toast,
    showExported: (title: string, format: ExportFormat) =>
      setToast(reportsMessages.exportedDetail(title, format)),
    dismissToast: () => setToast(null),
  };
}

function useExportFlow(type: ReportType, params: ReportPeriodParams) {
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const { toast, showExported, dismissToast } = useExportToast();
  const exportReport = useExportReport();

  const confirm = ({ title, period }: ExportTarget) => {
    if (!pendingFormat) return;
    const format = pendingFormat;
    const onSuccess = () => {
      setPendingFormat(null);
      showExported(title, format);
    };
    exportReport.mutate({ type, format, params, period }, { onSuccess });
  };

  const cancel = () => {
    exportReport.reset();
    setPendingFormat(null);
  };

  const feedback = { toast, dismissToast, exportReport };
  return { pendingFormat, request: setPendingFormat, confirm, cancel, ...feedback };
}

export type ExportFlow = ReturnType<typeof useExportFlow>;

export function useReportsPage() {
  const [type, setType] = useState<ReportType>('signups');
  const [period, setPeriod] = useState<Period>(DEFAULT_DASHBOARD_PERIOD);
  const params = toPeriodParams(period);
  const preview = useReportPreview(type, params);

  return { type, setType, period, setPeriod, preview, exportFlow: useExportFlow(type, params) };
}
