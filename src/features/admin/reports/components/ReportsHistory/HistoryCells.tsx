import { Badge } from '@/components/Badge/Badge';
import { Icon } from '@/components/Icon/Icon';

import {
  exportCode,
  exportPeriodLabel,
  formatAvailableUntil,
  reportTitle,
  requesterLabel,
} from '../../reports.history';
import type { ReportExport } from '../../reports.types';
import styles from './ReportsHistory.module.css';

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

export function AvailabilityCell({ item }: { item: ReportExport }) {
  if (item.expired) return <Badge tone="danger">Expirado</Badge>;
  return <Badge tone="info">{formatAvailableUntil(item.expiresAt)}</Badge>;
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
