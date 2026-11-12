import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import { useAuditLogs } from '../../audit-logs.queries';
import { AuditLogDetailDrawer } from '../../components/AuditLogDetailDrawer/AuditLogDetailDrawer';
import { AuditLogFilters } from '../../components/AuditLogFilters/AuditLogFilters';
import { AuditLogsHeader } from '../../components/AuditLogsHeader/AuditLogsHeader';
import { AuditLogsKpi } from '../../components/AuditLogsKpi/AuditLogsKpi';
import { AuditLogsTable } from '../../components/AuditLogsTable/AuditLogsTable';
import { type AuditLogFiltersController, useAuditLogFilters } from '../../hooks/useAuditLogFilters';
import styles from './AuditLogsPage.module.css';

interface AuditLogsResultsProps {
  query: ReturnType<typeof useAuditLogs>;
  controller: AuditLogFiltersController;
  onOpenDetail: (logId: string) => void;
}

function AuditLogsResults({ query, controller, onOpenDetail }: AuditLogsResultsProps) {
  if (query.isPending) return <LoadingState message="Carregando a trilha de auditoria…" />;
  if (query.isError) {
    return (
      <div className={styles.error}>
        <ErrorState title="Não foi possível carregar os registros" message={query.error.message} />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  return (
    <AuditLogsTable
      result={query.data}
      onOpenDetail={onOpenDetail}
      onFilterAdmin={controller.filterByAdmin}
      onPageChange={controller.setPage}
    />
  );
}

export function AuditLogsPage() {
  const controller = useAuditLogFilters();
  const query = useAuditLogs(controller.params);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  return (
    <section className={styles.page}>
      <AuditLogsHeader />
      <AuditLogsKpi last30Days={query.data?.meta.last30Days} />
      <AuditLogFilters controller={controller} shown={query.data?.data.length ?? 0} />
      <AuditLogsResults query={query} controller={controller} onOpenDetail={setSelectedLogId} />
      <AuditLogDetailDrawer logId={selectedLogId} onClose={() => setSelectedLogId(null)} />
    </section>
  );
}
