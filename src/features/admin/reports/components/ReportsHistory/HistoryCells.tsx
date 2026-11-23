import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import {
  exportCode,
  exportPeriodLabel,
  formatAvailableUntil,
  formatExportedAt,
  formatFileSize,
  reportTitle,
  requesterLabel,
} from '../../reports.history';
import { FORMAT_LABELS } from '../../reports.labels';
import type { ExportFormat, ReportExport } from '../../reports.types';
import styles from './ReportsHistory.module.css';

const FORMAT_ICONS: Record<ExportFormat, IconName> = { pdf: 'viewCarousel', csv: 'gridView' };

export function CodeCell({ item }: { item: ReportExport }) {
  return <span className={styles.code}>{exportCode(item.id)}</span>;
}

export function ReportCell({ item }: { item: ReportExport }) {
  return (
    <div className={styles.report}>
      <span className={styles.reportTitle}>{reportTitle(item.type)}</span>
      <span className={styles.reportPeriod}>{exportPeriodLabel(item)}</span>
    </div>
  );
}

export function RequesterCell({ item }: { item: ReportExport }) {
  return (
    <span className={styles.requester}>
      <span className={styles.avatar} aria-hidden="true">
        {item.requestedBy.name.charAt(0).toUpperCase()}
      </span>
      {requesterLabel(item)}
    </span>
  );
}

export function DateCell({ item }: { item: ReportExport }) {
  return <span className={styles.mono}>{formatExportedAt(item.createdAt)}</span>;
}

export function FileCell({ item }: { item: ReportExport }) {
  return (
    <span className={cn(styles.format, styles[item.format])}>
      <Icon name={FORMAT_ICONS[item.format]} size={12} />
      {`${FORMAT_LABELS[item.format]} • ${formatFileSize(item.fileSize)}`}
    </span>
  );
}

export function AvailabilityCell({ item }: { item: ReportExport }) {
  if (item.expired)
    return <span className={cn(styles.availability, styles.expired)}>Expirado</span>;
  return (
    <span className={cn(styles.availability, styles.available)}>
      {formatAvailableUntil(item.expiresAt)}
    </span>
  );
}

export function DownloadButton({
  item,
  onDownload,
}: {
  item: ReportExport;
  onDownload: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.download}
      aria-label={`Baixar ${exportCode(item.id)}`}
      onClick={onDownload}
    >
      <Icon name="download" size={14} />
      Baixar
    </button>
  );
}
