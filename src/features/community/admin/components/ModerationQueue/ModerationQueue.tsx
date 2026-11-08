import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';

import { formatPendingCases } from '../../community-admin.format';
import { useGroupMessageReports } from '../../community-admin.queries';
import type { OnCommunityAction } from '../../community-admin.types';
import styles from './ModerationQueue.module.css';
import { ReportCard } from './ReportCard';

const REPORTS_PAGE_SIZE = 10;

interface ModerationQueueProps {
  onAction: OnCommunityAction;
}

function QueueHeading({ total }: { total?: number }) {
  return (
    <header className={styles.heading}>
      <span className={styles.headingIcon} aria-hidden="true">
        <Icon name="gavel" size={16} />
      </span>
      <div>
        <h2 id="moderation-queue-title" className={styles.title}>
          Fila de Moderação
          {total !== undefined && (
            <span className={styles.pending}>{formatPendingCases(total)}</span>
          )}
        </h2>
        <p className={styles.subtitle}>
          Mensagens de grupos denunciadas pelos membros, das mais antigas para as mais recentes.
        </p>
      </div>
    </header>
  );
}

interface QueueListProps {
  query: ReturnType<typeof useGroupMessageReports>;
  onAction: OnCommunityAction;
  onPageChange: (page: number) => void;
}

function QueueList({ query, onAction, onPageChange }: QueueListProps) {
  if (query.isPending) return <LoadingState message="Carregando as denúncias…" />;
  if (query.isError) {
    return (
      <div className={styles.feedback}>
        <ErrorState message={query.error.message} />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }
  if (query.data.data.length === 0) return <EmptyState title="Nenhuma denúncia pendente" />;

  return (
    <>
      <div className={styles.list}>
        {query.data.data.map((report) => (
          <ReportCard key={report.id} report={report} onAction={onAction} />
        ))}
      </div>
      <Pagination {...query.data.meta} onPageChange={onPageChange} />
    </>
  );
}

export function ModerationQueue({ onAction }: ModerationQueueProps) {
  const [page, setPage] = useState(1);
  const query = useGroupMessageReports({ status: 'PENDING', page, pageSize: REPORTS_PAGE_SIZE });

  return (
    <section className={styles.section} aria-labelledby="moderation-queue-title">
      <QueueHeading total={query.data?.meta.total} />
      <QueueList query={query} onAction={onAction} onPageChange={setPage} />
    </section>
  );
}
