import type { Period } from '@/components/PeriodFilter/PeriodFilter';
import { Toast } from '@/components/Toast/Toast';

import { ExportConfirmDialog } from '../../components/ExportConfirmDialog/ExportConfirmDialog';
import { ReportPreviewPanel } from '../../components/ReportPreviewPanel/ReportPreviewPanel';
import { ReportsHistory } from '../../components/ReportsHistory/ReportsHistory';
import { ReportTypeGrid } from '../../components/ReportTypeGrid/ReportTypeGrid';
import { type ExportFlow, useReportsPage } from '../../hooks/useReportsPage';
import { reportsMessages } from '../../reports.labels';
import type { ReportPreview } from '../../reports.types';
import styles from './ReportsPage.module.css';

function PageHeader() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Exportar Relatórios</h1>
      <p className={styles.subtitle}>
        Escolha o relatório e o período, confira a prévia e exporte em PDF ou CSV.
      </p>
    </header>
  );
}

interface ExportFeedbackProps {
  flow: ExportFlow;
  preview?: ReportPreview;
  period: Period;
}

function ExportFeedback({ flow, preview, period }: ExportFeedbackProps) {
  return (
    <>
      <ExportConfirmDialog
        format={flow.pendingFormat}
        preview={preview}
        period={period}
        isExporting={flow.exportReport.isPending}
        errorMessage={flow.exportReport.error?.message}
        onConfirm={flow.confirm}
        onCancel={flow.cancel}
      />
      <Toast
        message={flow.toast && reportsMessages.exported}
        detail={flow.toast ?? undefined}
        tone="success"
        placement="top"
        onDismiss={flow.dismissToast}
      />
    </>
  );
}

export function ReportsPage() {
  const { type, setType, period, setPeriod, preview, exportFlow } = useReportsPage();

  return (
    <div className={styles.page}>
      <PageHeader />
      <div className={styles.columns}>
        <ReportTypeGrid selected={type} onSelect={setType} />
        <ReportPreviewPanel
          period={period}
          onPeriodChange={setPeriod}
          preview={preview}
          onExport={exportFlow.request}
        />
      </div>
      <ReportsHistory />
      <ExportFeedback flow={exportFlow} preview={preview.data} period={period} />
    </div>
  );
}
