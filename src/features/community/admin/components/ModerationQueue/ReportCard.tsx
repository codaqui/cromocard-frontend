import { Icon } from '@/components/Icon/Icon';

import { formatReportedAt } from '../../community-admin.format';
import type {
  GroupMessageReport,
  OnCommunityAction,
  ReportAction,
  ReportedMessage,
} from '../../community-admin.types';
import styles from './ModerationQueue.module.css';

interface ReportCardProps {
  report: GroupMessageReport;
  onAction: OnCommunityAction;
}

function ReportOrigin({
  report,
  message,
}: {
  report: GroupMessageReport;
  message: ReportedMessage;
}) {
  return (
    <dl className={styles.origin}>
      <div>
        <dt>Origem:</dt>
        <dd className={styles.strong}>{message.groupName}</dd>
      </div>
      <div>
        <dt>Denunciado por:</dt>
        <dd className={styles.reporter}>{report.reporterName}</dd>
      </div>
      <div>
        <dt>Timestamp:</dt>
        <dd>{formatReportedAt(message.createdAt)}</dd>
      </div>
    </dl>
  );
}

function ReportHeader({
  report,
  message,
}: {
  report: GroupMessageReport;
  message: ReportedMessage;
}) {
  return (
    <header className={styles.cardHeader}>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name="person" size={18} />
      </span>
      <div className={styles.cardIdentity}>
        <h3 className={styles.author}>{message.authorName}</h3>
        <ReportOrigin report={report} message={message} />
      </div>
      <span className={styles.reason}>{report.reason}</span>
    </header>
  );
}

function ReportedText({ message }: { message: ReportedMessage }) {
  return (
    <blockquote className={styles.quote}>
      <p className={styles.quoteLabel}>
        <Icon name="formatQuote" size={14} />
        Transcrição exata da mensagem denunciada:
      </p>
      <p className={styles.quoteText}>“{message.content}”</p>
    </blockquote>
  );
}

function ReportActions({ report, onAction }: ReportCardProps) {
  const act = (action: ReportAction) => () => onAction({ kind: 'report', action, report });

  return (
    <div className={styles.cardActions}>
      <button type="button" className={styles.dismiss} onClick={act('dismiss')}>
        <Icon name="checkCircle" size={14} />
        Dispensar Denúncia
      </button>
      <button type="button" className={styles.removeMessage} onClick={act('removeMessage')}>
        <Icon name="warning" size={14} />
        Remover Mensagem
      </button>
    </div>
  );
}

export function ReportCard({ report, onAction }: ReportCardProps) {
  const { message } = report;
  if (!message) return null;

  return (
    <article className={styles.card} aria-label={`Denúncia contra ${message.authorName}`}>
      <ReportHeader report={report} message={message} />
      <ReportedText message={message} />
      {report.description && (
        <p className={styles.description}>
          <Icon name="shield" size={14} />
          {report.description}
        </p>
      )}
      <ReportActions report={report} onAction={onAction} />
    </article>
  );
}
