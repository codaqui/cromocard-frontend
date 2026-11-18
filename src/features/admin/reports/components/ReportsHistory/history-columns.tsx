import type { DataTableColumn } from '@/components/DataTable/DataTable';

import { exportCode, formatExportedAt, formatFileSize } from '../../reports.history';
import { FORMAT_LABELS } from '../../reports.labels';
import type { ReportExport } from '../../reports.types';
import { AvailabilityCell, DownloadButton, ReportCell, RequesterCell } from './HistoryCells';

export function historyColumns(
  onDownload: (item: ReportExport) => void,
): DataTableColumn<ReportExport>[] {
  return [
    { key: 'code', header: 'Código', render: (item) => exportCode(item.id) },
    { key: 'report', header: 'Relatório', render: (item) => <ReportCell item={item} /> },
    { key: 'requester', header: 'Solicitante', render: (item) => <RequesterCell item={item} /> },
    { key: 'createdAt', header: 'Data e hora', render: (item) => formatExportedAt(item.createdAt) },
    {
      key: 'file',
      header: 'Formato e tamanho',
      render: (item) => `${FORMAT_LABELS[item.format]} • ${formatFileSize(item.fileSize)}`,
    },
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
