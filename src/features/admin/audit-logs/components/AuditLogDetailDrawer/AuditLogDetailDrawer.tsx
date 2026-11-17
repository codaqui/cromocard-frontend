import { Drawer } from '@/components/Drawer/Drawer';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import { formatAuditDateTime, reasonOf } from '../../audit-logs.format';
import { auditActionMeta, auditEntityTypeLabel } from '../../audit-logs.labels';
import { useAuditLogDetail } from '../../audit-logs.queries';
import type { AuditLogDetail } from '../../audit-logs.types';
import styles from './AuditLogDetailDrawer.module.css';

interface DetailItemProps {
  label: string;
  value: string;
  code: string;
}

function DetailItem({ label, value, code }: DetailItemProps) {
  return (
    <div className={styles.item}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      <dd className={styles.code}>{code}</dd>
    </div>
  );
}

function DetailSummary({ log }: { log: AuditLogDetail }) {
  return (
    <dl className={styles.grid}>
      <DetailItem label="Responsável (admin)" value={log.admin.name} code={log.admin.id} />
      <DetailItem
        label="Data e hora (BRT)"
        value={formatAuditDateTime(log.createdAt).dateTime}
        code={log.createdAt}
      />
      <DetailItem
        label="Ação executada"
        value={auditActionMeta(log.action).label}
        code={log.action}
      />
      <DetailItem
        label="Entidade alvo"
        value={auditEntityTypeLabel(log.entityType)}
        code={log.entityId ?? 'Sem ID de entidade'}
      />
    </dl>
  );
}

function DetailBody({ log }: { log: AuditLogDetail }) {
  const reason = reasonOf(log.details);

  return (
    <div className={styles.body}>
      <DetailSummary log={log} />
      <section className={styles.section}>
        <h3 className={styles.label}>Motivo</h3>
        <p className={styles.reason}>{reason ?? 'Sem motivo registrado'}</p>
      </section>
      <section className={styles.section}>
        <h3 className={styles.label}>Detalhes completos (JSON)</h3>
        <pre className={styles.json}>{JSON.stringify(log.details ?? {}, null, 2)}</pre>
      </section>
    </div>
  );
}

function DetailContent({ logId }: { logId: string }) {
  const query = useAuditLogDetail(logId);

  if (query.isPending) return <LoadingState message="Carregando os detalhes…" />;
  if (query.isError) {
    return (
      <ErrorState title="Não foi possível carregar o registro" message={query.error.message} />
    );
  }

  return <DetailBody log={query.data} />;
}

interface AuditLogDetailDrawerProps {
  logId: string | null;
  onClose: () => void;
}

export function AuditLogDetailDrawer({ logId, onClose }: AuditLogDetailDrawerProps) {
  return (
    <Drawer open={logId !== null} title="Detalhes do registro de auditoria" onClose={onClose}>
      {logId && <DetailContent logId={logId} />}
    </Drawer>
  );
}
