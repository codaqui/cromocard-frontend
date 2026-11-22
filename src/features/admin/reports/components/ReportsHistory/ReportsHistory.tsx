import { DataTable } from '@/components/DataTable/DataTable';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';

import type { ReportsHistoryState } from '../../hooks/useReportsHistory';
import type { ExportFlow } from '../../hooks/useReportsPage';
import { reportsMessages } from '../../reports.labels';
import { ExpiredExportDialog } from './ExpiredExportDialog';
import { historyColumns } from './history-columns';
import styles from './ReportsHistory.module.css';

interface ReportsHistoryProps {
  history: ReportsHistoryState;
  flow: ExportFlow;
}

function RefreshButton({ history }: { history: ReportsHistoryState }) {
  return (
    <button
      type="button"
      className={styles.refresh}
      aria-label="Atualizar histórico"
      disabled={history.isRefreshing}
      onClick={history.refresh}
    >
      <Icon name="refresh" size={18} />
    </button>
  );
}

function HistoryHeader({ history }: { history: ReportsHistoryState }) {
  return (
    <header className={styles.header}>
      <span className={styles.icon}>
        <Icon name="history" size={18} />
      </span>
      <div className={styles.heading}>
        <h2 id="reports-history-title" className={styles.title}>
          Histórico de relatórios
        </h2>
        <p className={styles.subtitle}>Relatórios exportados pela equipe nos últimos 90 dias.</p>
      </div>
      <span className={styles.retention}>Arquivos disponíveis por 90 dias</span>
      <RefreshButton history={history} />
    </header>
  );
}

function HistoryTable({ history }: { history: ReportsHistoryState }) {
  const { exportsQuery, requestDownload, setPage } = history;
  if (exportsQuery.isPending) return <LoadingState message="Carregando o histórico…" />;
  if (exportsQuery.isError) return <ErrorState message={exportsQuery.error.message} />;
  const { data: items, meta } = exportsQuery.data;
  if (meta.total === 0) return <p className={styles.empty}>{reportsMessages.historyEmpty}</p>;
  return (
    <>
      <DataTable
        flat
        pinLastColumn
        caption="Histórico de relatórios"
        columns={historyColumns(requestDownload)}
        rows={items}
        getRowKey={(item) => item.id}
      />
      <Pagination {...meta} itemLabel="relatórios" onPageChange={setPage} />
    </>
  );
}

export function ReportsHistory({ history, flow }: ReportsHistoryProps) {
  const { expiredExport, downloadError } = history;
  return (
    <section className={styles.panel} aria-labelledby="reports-history-title">
      <HistoryHeader history={history} />
      {downloadError && (
        <p role="alert" className={styles.error}>
          {downloadError.message}
        </p>
      )}
      <HistoryTable history={history} />
      <ExpiredExportDialog
        item={expiredExport.expired}
        isRegenerating={flow.exportReport.isPending}
        errorMessage={flow.exportReport.error?.message}
        onRegenerate={expiredExport.regenerate}
        onClose={expiredExport.close}
      />
    </section>
  );
}
