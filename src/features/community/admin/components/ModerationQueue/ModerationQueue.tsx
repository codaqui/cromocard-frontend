import { useId, useState } from 'react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';
import type { SanctionTarget } from '@/features/users';
import { cn } from '@/utils/cn';

import { formatPendingCases } from '../../community-admin.format';
import { severityFilterOptions } from '../../community-admin.labels';
import { useGroupMessageReports } from '../../community-admin.queries';
import type { OnCommunityAction, ReportSeverity } from '../../community-admin.types';
import { RetryableError } from '../RetryableError/RetryableError';
import styles from './ModerationQueue.module.css';
import { ReportCard } from './ReportCard';

const REPORTS_PAGE_SIZE = 10;

interface ModerationQueueProps {
  onAction: OnCommunityAction;
  onSanctionAuthor: (target: SanctionTarget) => void;
}

function useSeverityCounts() {
  const critical = useGroupMessageReports({
    status: 'PENDING',
    severity: 'CRITICAL',
    page: 1,
    pageSize: 1,
  });
  const spam = useGroupMessageReports({
    status: 'PENDING',
    severity: 'SPAM',
    page: 1,
    pageSize: 1,
  });

  return { CRITICAL: critical.data?.meta.total, SPAM: spam.data?.meta.total };
}

function SeverityChip({
  severity,
  count,
  selected,
  onSelect,
}: {
  severity: ReportSeverity;
  count?: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(styles.severityChip, selected && styles.severityChipSelected)}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {severityFilterOptions.find((option) => option.value === severity)?.label}
      {count !== undefined && ` (${count})`}
    </button>
  );
}

function SeverityFilter({
  severity,
  counts,
  onChange,
}: {
  severity: ReportSeverity;
  counts: Record<ReportSeverity, number | undefined>;
  onChange: (severity: ReportSeverity) => void;
}) {
  return (
    <div className={styles.severityFilter} role="group" aria-label="Gravidade">
      <span className={styles.severityLabel}>Gravidade:</span>
      {severityFilterOptions.map(({ value }) => (
        <SeverityChip
          key={value}
          severity={value}
          count={counts[value]}
          selected={severity === value}
          onSelect={() => onChange(value)}
        />
      ))}
    </div>
  );
}

function QueueTitle({ total, titleId }: { total?: number; titleId: string }) {
  return (
    <div className={styles.headingMain}>
      <h2 id={titleId} className={styles.title}>
        Fila de Moderação
        {total !== undefined && <span className={styles.pending}>{formatPendingCases(total)}</span>}
      </h2>
      <p className={styles.subtitle}>
        Mensagens de grupos denunciadas pelos membros, das mais antigas para as mais recentes.
      </p>
    </div>
  );
}

function QueueHeading({
  total,
  titleId,
  severity,
  counts,
  onSeverityChange,
}: {
  total?: number;
  titleId: string;
  severity: ReportSeverity;
  counts: Record<ReportSeverity, number | undefined>;
  onSeverityChange: (severity: ReportSeverity) => void;
}) {
  return (
    <header className={styles.heading}>
      <span className={styles.headingIcon} aria-hidden="true">
        <Icon name="gavel" size={16} />
      </span>
      <QueueTitle total={total} titleId={titleId} />
      <SeverityFilter severity={severity} counts={counts} onChange={onSeverityChange} />
    </header>
  );
}

interface QueueListProps {
  query: ReturnType<typeof useGroupMessageReports>;
  onAction: OnCommunityAction;
  onSanctionAuthor: (target: SanctionTarget) => void;
  onPageChange: (page: number) => void;
}

function QueueList({ query, onAction, onSanctionAuthor, onPageChange }: QueueListProps) {
  if (query.isPending) return <LoadingState message="Carregando as denúncias…" />;
  if (query.isError) {
    return <RetryableError message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (query.data.data.length === 0) return <EmptyState title="Nenhuma denúncia pendente" />;

  return (
    <>
      <div className={styles.list}>
        {query.data.data.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onAction={onAction}
            onSanctionAuthor={onSanctionAuthor}
          />
        ))}
      </div>
      <Pagination {...query.data.meta} onPageChange={onPageChange} />
    </>
  );
}

function useModerationQueueState() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<ReportSeverity>('CRITICAL');
  const counts = useSeverityCounts();
  const query = useGroupMessageReports({
    status: 'PENDING',
    severity,
    page,
    pageSize: REPORTS_PAGE_SIZE,
  });

  const changeSeverity = (next: ReportSeverity) => {
    setSeverity(next);
    setPage(1);
  };

  return { severity, counts, query, changeSeverity, changePage: setPage };
}

export function ModerationQueue({ onAction, onSanctionAuthor }: ModerationQueueProps) {
  const { severity, counts, query, changeSeverity, changePage } = useModerationQueueState();
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <QueueHeading
        total={counts.CRITICAL}
        titleId={titleId}
        severity={severity}
        counts={counts}
        onSeverityChange={changeSeverity}
      />
      <QueueList
        query={query}
        onAction={onAction}
        onSanctionAuthor={onSanctionAuthor}
        onPageChange={changePage}
      />
    </section>
  );
}
