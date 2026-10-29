import type { ReactNode } from 'react';

import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
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

type DataTableBodyProps<T> = Omit<DataTableProps<T>, 'caption'> & { emptyMessage: string };

function DataTableBody<T>({ columns, rows, getRowKey, emptyMessage }: DataTableBodyProps<T>) {
  return (
    <tbody>
      {rows.length === 0 && <EmptyRow colSpan={columns.length} message={emptyMessage} />}
      {rows.map((row) => (
        <tr key={getRowKey(row)}>
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
  ...body
}: DataTableProps<T>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <DataTableHead columns={body.columns} />
        <DataTableBody {...body} emptyMessage={emptyMessage} />
      </table>
    </div>
  );
}
