import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  flat?: boolean;
  pinLastColumn?: boolean;
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.empty}>
        {message}
      </td>
    </tr>
  );
}

function DataTableHead<T>({ columns }: { columns: DataTableColumn<T>[] }) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.key} scope="col">
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

type DataTableBodyProps<T> = Omit<DataTableProps<T>, 'caption' | 'flat' | 'pinLastColumn'> & {
  emptyMessage: string;
};

function DataTableBody<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage,
  onRowClick,
}: DataTableBodyProps<T>) {
  return (
    <tbody>
      {rows.length === 0 && <EmptyRow colSpan={columns.length} message={emptyMessage} />}
      {rows.map((row) => (
        <tr
          key={getRowKey(row)}
          className={onRowClick && styles.clickable}
          onClick={onRowClick && (() => onRowClick(row))}
        >
          {columns.map((column) => (
            <td key={column.key}>{column.render(row)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function DataTable<T>({
  caption,
  emptyMessage = 'Nenhum registro encontrado',
  flat,
  pinLastColumn,
  ...body
}: DataTableProps<T>) {
  return (
    <div
      className={cn(styles.wrapper, flat && styles.flat, pinLastColumn && styles.pinned)}
      role="region"
      aria-label={`Tabela ${caption}`}
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <DataTableHead columns={body.columns} />
        <DataTableBody {...body} emptyMessage={emptyMessage} />
      </table>
    </div>
  );
}
