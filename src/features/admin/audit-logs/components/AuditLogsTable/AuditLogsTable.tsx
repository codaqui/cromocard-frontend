import { useId } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { formatCount } from '../../audit-logs.format';
import type { AuditLogListItem, AuditLogPage } from '../../audit-logs.types';
import { AuditLogRow, type AuditLogRowActions } from './AuditLogRow';
import { AuditLogsPager } from './AuditLogsPager';
import styles from './AuditLogsTable.module.css';

const EMPTY_MESSAGE = 'Nenhum registro encontrado';
const COLUMNS = [
  'Data & hora exata',
  'Responsável (staff)',
  'Ação executada',
  'Alvo da operação',
  'Motivo registrado',
];

function Toolbar({ titleId }: { titleId: string }) {
  return (
    <header className={styles.toolbar}>
      <h2 id={titleId} className={styles.title}>
        <span className={styles.titleIcon}>
          <Icon name="database" size={20} />
        </span>
        Registros de Execução de Segurança
      </h2>
      <p className={styles.toolbarMeta}>Timestamp: ISO 8601 / BRT (UTC-3)</p>
    </header>
  );
}

interface RowsProps extends AuditLogRowActions {
  logs: AuditLogListItem[];
}

function Rows({ logs, ...actions }: RowsProps) {
  if (logs.length === 0) {
    return (
      <tr>
        <td colSpan={COLUMNS.length} className={styles.empty}>
          {EMPTY_MESSAGE}
        </td>
      </tr>
    );
  }

  return logs.map((log) => <AuditLogRow key={log.id} log={log} {...actions} />);
}

interface FooterProps {
  meta: AuditLogPage['meta'];
  shown: number;
  onPageChange: (page: number) => void;
}

function Footer({ meta, shown, onPageChange }: FooterProps) {
  const first = shown === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const last = shown === 0 ? 0 : first + shown - 1;

  return (
    <footer className={styles.footer}>
      <p className={styles.ledger}>
        <span className={styles.ledgerDot} aria-hidden="true" />
        Trilha de auditoria imutável: sem edição nem exclusão
      </p>
      <div className={styles.pagination}>
        <p className={styles.showing}>
          Exibindo {first}–{last} de {formatCount(meta.total)} registros
        </p>
        <AuditLogsPager page={meta.page} totalPages={meta.totalPages} onPageChange={onPageChange} />
      </div>
    </footer>
  );
}

interface AuditLogsTableProps extends AuditLogRowActions {
  result: AuditLogPage;
  onPageChange: (page: number) => void;
}

export function AuditLogsTable({ result, onPageChange, ...actions }: AuditLogsTableProps) {
  const titleId = useId();

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <Toolbar titleId={titleId} />
      <div className={styles.scroll}>
        <table className={styles.table} aria-labelledby={titleId}>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Rows logs={result.data} {...actions} />
          </tbody>
        </table>
      </div>
      <Footer meta={result.meta} shown={result.data.length} onPageChange={onPageChange} />
    </section>
  );
}
