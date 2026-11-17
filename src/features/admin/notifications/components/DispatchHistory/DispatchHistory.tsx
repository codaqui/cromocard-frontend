import { type Ref, useState } from 'react';

import { Badge } from '@/components/Badge/Badge';
import { type DataTableColumn, DataTable } from '@/components/DataTable/DataTable';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';

import { formatCount, formatDispatchDate } from '../../global-notifications.format';
import { AUDIENCE_LABELS, STATUS_META, channelsLabel } from '../../global-notifications.labels';
import { useDispatchHistory } from '../../global-notifications.queries';
import type { GlobalNotification, RecipientsCount } from '../../global-notifications.types';
import styles from './DispatchHistory.module.css';
import type { PaginatedResponse } from '@/types/api';

export const HISTORY_PAGE_SIZE = 10;

interface DispatchHistoryProps {
  ref?: Ref<HTMLElement>;
  counts?: RecipientsCount;
  onCancelSchedule: (dispatch: GlobalNotification) => void;
}

/** Entregue mostra quantos receberam; na fila ou cancelado, o tamanho atual do público. */
function audienceOf(dispatch: GlobalNotification, counts?: RecipientsCount) {
  const total = dispatch.status === 'SENT' ? dispatch.recipientCount : counts?.[dispatch.audience];
  const label = AUDIENCE_LABELS[dispatch.audience];
  return total === undefined ? label : `${label} (${formatCount(total)})`;
}

function StatusCell({
  dispatch,
  onCancelSchedule,
}: { dispatch: GlobalNotification } & Pick<DispatchHistoryProps, 'onCancelSchedule'>) {
  const { label, tone } = STATUS_META[dispatch.status];
  return (
    <span className={styles.status}>
      <Badge tone={tone}>{label}</Badge>
      {dispatch.status === 'SCHEDULED' && (
        <button type="button" className={styles.cancel} onClick={() => onCancelSchedule(dispatch)}>
          Cancelar agendamento
        </button>
      )}
    </span>
  );
}

const dateOf = (dispatch: GlobalNotification) =>
  formatDispatchDate(dispatch.scheduledAt ?? dispatch.sentAt ?? dispatch.createdAt);

const DATE_AND_TITLE: DataTableColumn<GlobalNotification>[] = [
  {
    key: 'date',
    header: 'Data & horário',
    render: (row) => <span className={styles.date}>{dateOf(row)}</span>,
  },
  {
    key: 'title',
    header: 'Título',
    render: (row) => <span className={styles.title}>{row.title}</span>,
  },
];

function columnsOf(
  counts: RecipientsCount | undefined,
  onCancelSchedule: DispatchHistoryProps['onCancelSchedule'],
): DataTableColumn<GlobalNotification>[] {
  return [
    ...DATE_AND_TITLE,
    {
      key: 'audience',
      header: 'Público',
      render: (row) => <span className={styles.audience}>{audienceOf(row, counts)}</span>,
    },
    { key: 'channels', header: 'Canal', render: (row) => channelsLabel(row.channels) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusCell dispatch={row} onCancelSchedule={onCancelSchedule} />,
    },
  ];
}

interface HistoryTableProps extends Omit<DispatchHistoryProps, 'ref'> {
  page: PaginatedResponse<GlobalNotification>;
  onPageChange: (page: number) => void;
}

function HistoryTable({
  page: { data, meta },
  counts,
  onCancelSchedule,
  onPageChange,
}: HistoryTableProps) {
  return (
    <>
      <DataTable
        caption="Histórico de disparos"
        columns={columnsOf(counts, onCancelSchedule)}
        rows={data}
        getRowKey={(dispatch) => dispatch.id}
        emptyMessage="Nenhum disparo ainda."
      />
      <Pagination {...meta} itemLabel="disparos" onPageChange={onPageChange} />
    </>
  );
}

function HistoryBody(props: Omit<DispatchHistoryProps, 'ref'>) {
  const [page, setPage] = useState(1);
  const history = useDispatchHistory({ page, pageSize: HISTORY_PAGE_SIZE });

  if (history.isPending) return <LoadingState message="Carregando o histórico…" />;
  if (history.isError) {
    return (
      <ErrorState title="Não foi possível carregar o histórico" message={history.error.message} />
    );
  }
  return <HistoryTable {...props} page={history.data} onPageChange={setPage} />;
}

/** Histórico de disparos do frame 208-2380 (CCD060 R16, CCD100 R8–R9, CCD101 R10). */
export function DispatchHistory({ ref, ...props }: DispatchHistoryProps) {
  return (
    <section ref={ref} className={styles.card} aria-labelledby="dispatch-history" tabIndex={-1}>
      <header>
        <h2 id="dispatch-history" className={styles.heading}>
          <Icon name="history" size={22} />
          Histórico de disparos
        </h2>
        <p className={styles.subtitle}>Do mais recente para o mais antigo.</p>
      </header>
      <HistoryBody {...props} />
    </section>
  );
}
