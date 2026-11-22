import type { DataTableColumn } from '@/components/DataTable/DataTable';

import type { ReportExport } from '../../reports.types';
import {
  AvailabilityCell,
  CodeCell,
  DateCell,
  DownloadButton,
  FileCell,
  ReportCell,
  RequesterCell,
} from './HistoryCells';

export function historyColumns(
  onDownload: (item: ReportExport) => void,
): DataTableColumn<ReportExport>[] {
  return [
    { key: 'code', header: 'Código', render: (item) => <CodeCell item={item} /> },
    { key: 'report', header: 'Relatório', render: (item) => <ReportCell item={item} /> },
    { key: 'requester', header: 'Solicitante', render: (item) => <RequesterCell item={item} /> },
    { key: 'createdAt', header: 'Data e hora', render: (item) => <DateCell item={item} /> },
    { key: 'file', header: 'Formato e tamanho', render: (item) => <FileCell item={item} /> },
    {
      key: 'expiresAt',
      header: 'Disponível até',
      render: (item) => <AvailabilityCell item={item} />,
    },
    {
      key: 'action',
      header: 'Ação',
      render: (item) => <DownloadButton item={item} onDownload={() => onDownload(item)} />,
    },
  ];
}
