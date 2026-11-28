import { Icon } from '@/components/Icon/Icon';
import type { SanctionTarget } from '@/features/users';

import { formatReportedAt, formatReportedBy } from '../../community-admin.format';
import type {
  GroupMessageReport,
  OnCommunityAction,
  ReportAction,
  ReportedMessage,
} from '../../community-admin.types';
import { ChatReportCard } from './ChatReportCard';
import styles from './ModerationQueue.module.css';
import { AuthorPills, OriginItem } from './ReportParts';

interface ReportCardProps {
  report: GroupMessageReport;
  onAction: OnCommunityAction;
  onSanctionAuthor: (target: SanctionTarget) => void;
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
      <OriginItem label="Origem:">
        <span className={styles.strong}>{message.groupName}</span>
      </OriginItem>
      <OriginItem label="Denunciado por:">
        <span className={styles.reporter}>
          {formatReportedBy(report.reporterName, message.reportersCount)}
        </span>
      </OriginItem>
      <OriginItem label="Denunciada em:">{formatReportedAt(message.createdAt)}</OriginItem>
    </dl>
  );
}

function AuthorStats({ message }: { message: ReportedMessage }) {
  return (
    <AuthorPills accountAgeDays={message.authorAccountAgeDays} warnings={message.authorWarnings} />
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
        <AuthorStats message={message} />
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

function sanctionTargetOf(report: GroupMessageReport, message: ReportedMessage): SanctionTarget {
  return {
    id: message.authorId,
    name: message.authorName,
    username: null,
    warningsCount: message.authorWarnings,
    reportId: report.id,
  };
}

function ResolveActions({
  report,
  onAction,
}: {
  report: GroupMessageReport;
  onAction: OnCommunityAction;
}) {
  const act = (action: ReportAction) => () => onAction({ kind: 'report', action, report });

  return (
    <>
      <button type="button" className={styles.dismiss} onClick={act('dismiss')}>
        <Icon name="checkCircle" size={14} />
        Dispensar Denúncia
      </button>
      <button type="button" className={styles.removeMessage} onClick={act('removeMessage')}>
        <Icon name="warning" size={14} />
        Remover Mensagem
      </button>
      <button type="button" className={styles.removeAndWarn} onClick={act('removeAndWarn')}>
        <Icon name="warning" size={14} />
        Remover Mensagem &amp; Advertir Usuário
      </button>
    </>
  );
}

function ReportActions({
  report,
  message,
  onAction,
  onSanctionAuthor,
}: ReportCardProps & { message: ReportedMessage }) {
  return (
    <div className={styles.cardActions}>
      <ResolveActions report={report} onAction={onAction} />
      <button
        type="button"
        className={styles.sanctionAuthor}
        onClick={() => onSanctionAuthor(sanctionTargetOf(report, message))}
      >
        <Icon name="block" size={14} />
        Aplicar sanção ao autor
      </button>
    </div>
  );
}

function GroupReportCard({ report, onAction, onSanctionAuthor }: ReportCardProps) {
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
      <ReportActions
        report={report}
        onAction={onAction}
        onSanctionAuthor={onSanctionAuthor}
        message={message}
      />
    </article>
  );
}

export function ReportCard(props: ReportCardProps) {
  const { origin, reportedUser } = props.report;
  if (origin === 'CHAT' && reportedUser) {
    return <ChatReportCard {...props} reportedUser={reportedUser} />;
  }
  return <GroupReportCard {...props} />;
}
