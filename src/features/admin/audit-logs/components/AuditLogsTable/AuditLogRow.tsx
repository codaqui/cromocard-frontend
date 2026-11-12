import { cn } from '@/utils/cn';

import { formatAuditDateTime, initialsOf, shortId } from '../../audit-logs.format';
import {
  type AuditActionTone,
  auditActionMeta,
  auditEntityTypeLabel,
} from '../../audit-logs.labels';
import type { AuditLogAdmin, AuditLogListItem } from '../../audit-logs.types';
import { AuditActionBadge } from '../AuditActionBadge/AuditActionBadge';
import styles from './AuditLogsTable.module.css';

function DateCell({ createdAt }: { createdAt: string }) {
  const { dateTime, milliseconds } = formatAuditDateTime(createdAt);

  return (
    <>
      <time dateTime={createdAt} className={styles.timestamp}>
        {dateTime}
      </time>
      <p className={styles.timestampSub}>BRT (UTC-3) • ms: .{milliseconds}</p>
    </>
  );
}

interface StaffCellProps {
  admin: AuditLogAdmin;
  onFilterAdmin: (adminId: string) => void;
}

function StaffCell({ admin, onFilterAdmin }: StaffCellProps) {
  return (
    <div className={styles.staff}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(admin.name)}
      </span>
      <div className={styles.staffInfo}>
        <button
          type="button"
          className={styles.staffName}
          title="Filtrar os registros deste admin"
          onClick={() => onFilterAdmin(admin.id)}
        >
          {admin.name}
        </button>
        <span className={styles.staffId} title={admin.id}>
          ID: {shortId(admin.id)}
        </span>
      </div>
    </div>
  );
}

function TargetCell({ log, tone }: { log: AuditLogListItem; tone: AuditActionTone }) {
  return (
    <div className={styles.target}>
      <span className={cn(styles.targetTitle, styles[tone])}>
        {auditEntityTypeLabel(log.entityType)}
      </span>
      <span className={styles.mono}>{log.entityId ? `#${log.entityId}` : 'Sem ID específico'}</span>
    </div>
  );
}

interface ReasonCellProps {
  log: AuditLogListItem;
  tone: AuditActionTone;
  onOpenDetail: (logId: string) => void;
}

function ReasonCell({ log, tone, onOpenDetail }: ReasonCellProps) {
  return (
    <div className={styles.reason}>
      <span className={cn(styles.reasonTag, styles[tone])}>Motivo:</span>
      <p className={cn(styles.reasonText, !log.reason && styles.reasonEmpty)}>
        {log.reason ? `“${log.reason}”` : 'Sem motivo registrado'}
      </p>
      <button type="button" className={styles.detailLink} onClick={() => onOpenDetail(log.id)}>
        Ver detalhes completos
      </button>
    </div>
  );
}

export interface AuditLogRowActions {
  onOpenDetail: (logId: string) => void;
  onFilterAdmin: (adminId: string) => void;
}

type AuditLogRowProps = AuditLogRowActions & { log: AuditLogListItem };

export function AuditLogRow({ log, onOpenDetail, onFilterAdmin }: AuditLogRowProps) {
  const { tone } = auditActionMeta(log.action);

  return (
    <tr>
      <td>
        <DateCell createdAt={log.createdAt} />
      </td>
      <td>
        <StaffCell admin={log.admin} onFilterAdmin={onFilterAdmin} />
      </td>
      <td>
        <AuditActionBadge action={log.action} />
      </td>
      <td>
        <TargetCell log={log} tone={tone} />
      </td>
      <td>
        <ReasonCell log={log} tone={tone} onOpenDetail={onOpenDetail} />
      </td>
    </tr>
  );
}
