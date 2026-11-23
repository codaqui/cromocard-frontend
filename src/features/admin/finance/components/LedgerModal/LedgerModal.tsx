import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { DataTable, type DataTableColumn } from '@/components/DataTable/DataTable';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Modal } from '@/components/Modal/Modal';
import { Pagination } from '@/components/Pagination/Pagination';
import { cn } from '@/utils/cn';

import {
  MOVEMENT_LABELS,
  formatCount,
  formatCurrency,
  formatLedgerDay,
  formatLedgerTime,
  orderCode,
} from '../../finance.format';
import { useLedger } from '../../finance.queries';
import type { LedgerEntry, LedgerMeta } from '../../finance.types';
import styles from './LedgerModal.module.css';

interface LedgerModalProps {
  open: boolean;
  onClose: () => void;
}

const COLUMNS: DataTableColumn<LedgerEntry>[] = [
  { key: 'at', header: 'Hora', render: (entry) => formatLedgerTime(entry.at) },
  { key: 'order', header: 'Pedido', render: (entry) => orderCode(entry.orderId) },
  { key: 'buyer', header: 'Comprador', render: (entry) => entry.buyer },
  { key: 'seller', header: 'Vendedor', render: (entry) => entry.seller },
  {
    key: 'type',
    header: 'Tipo',
    render: (entry) => (
      <span className={cn(entry.type === 'RELEASE' && styles.release)}>
        {MOVEMENT_LABELS[entry.type]}
      </span>
    ),
  },
  { key: 'amount', header: 'Valor', render: (entry) => formatCurrency(entry.amountCents) },
];

interface TotalProps {
  label: string;
  cents: number;
  tone?: 'release' | 'retained';
}

function Total({ label, cents, tone }: TotalProps) {
  return (
    <div className={styles.total}>
      <span className={styles.totalLabel}>{label}</span>
      <span className={cn(styles.totalValue, tone && styles[tone])}>{formatCurrency(cents)}</span>
    </div>
  );
}

function Totals({ totals }: Pick<LedgerMeta, 'totals'>) {
  return (
    <div className={styles.totals}>
      <Total label="Recebido hoje" cents={totals.receivedCents} />
      <Total label="Liberado hoje" cents={totals.releasedCents} tone="release" />
      <Total label="Retido em garantia" cents={totals.retainedCents} tone="retained" />
    </div>
  );
}

interface LedgerContentProps {
  entries: LedgerEntry[];
  meta: LedgerMeta;
  onPageChange: (page: number) => void;
}

function LedgerContent({ entries, meta, onPageChange }: LedgerContentProps) {
  return (
    <div className={styles.content}>
      <Totals totals={meta.totals} />
      <DataTable
        caption="Movimentações de hoje"
        columns={COLUMNS}
        rows={entries}
        getRowKey={(entry) => `${entry.type}-${entry.orderId}`}
        emptyMessage="Não houve movimentação hoje."
      />
      <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
    </div>
  );
}

type LedgerQuery = ReturnType<typeof useLedger>;

interface LedgerBodyProps {
  query: LedgerQuery;
  onPageChange: (page: number) => void;
}

function LedgerBody({ query, onPageChange }: LedgerBodyProps) {
  if (query.isPending) return <LoadingState message="Carregando o livro razão…" />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  return (
    <LedgerContent entries={query.data.data} meta={query.data.meta} onPageChange={onPageChange} />
  );
}

const subtitleOf = (day: string | undefined) =>
  day && `Pagamentos recebidos e liberações aos vendedores em ${formatLedgerDay(day)}.`;

function countLabel(shown: number, total: number) {
  const noun = total === 1 ? 'movimentação' : 'movimentações';
  return `Mostrando ${formatCount(shown)} de ${formatCount(total)} ${noun} de hoje`;
}

interface LedgerFooterProps {
  page: LedgerQuery['data'];
  onClose: () => void;
}

function LedgerFooter({ page, onClose }: LedgerFooterProps) {
  return (
    <div className={styles.footer}>
      {page && (
        <span className={styles.count}>{countLabel(page.data.length, page.meta.total)}</span>
      )}
      <Button variant="secondary" onClick={onClose}>
        Fechar
      </Button>
    </div>
  );
}

export function LedgerModal({ open, onClose }: LedgerModalProps) {
  const [page, setPage] = useState(1);
  const query = useLedger({ page }, open);
  const close = () => {
    setPage(1);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Livro Razão de Hoje"
      subtitle={subtitleOf(query.data?.meta.day.from)}
      size="large"
      onClose={close}
      footer={<LedgerFooter page={query.data} onClose={close} />}
    >
      <LedgerBody query={query} onPageChange={setPage} />
    </Modal>
  );
}
