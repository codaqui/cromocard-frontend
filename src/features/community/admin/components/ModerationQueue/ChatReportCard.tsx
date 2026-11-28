import { Icon } from '@/components/Icon/Icon';
import type { SanctionTarget } from '@/features/users';

import type {
  GroupMessageReport,
  OnCommunityAction,
  ReportedUser,
} from '../../community-admin.types';
import { EvidenceThumbnail } from './EvidenceThumbnail';
import styles from './ModerationQueue.module.css';
import { AuthorPills, OriginItem } from './ReportParts';

interface ChatReportCardProps {
  report: GroupMessageReport;
  reportedUser: ReportedUser;
  onAction: OnCommunityAction;
  onSanctionAuthor: (target: SanctionTarget) => void;
}

const reporterOf = ({ reporterUsername, reporterName }: GroupMessageReport) =>
  reporterUsername ? `@${reporterUsername}` : reporterName;

function ChatOrigin({ report }: { report: GroupMessageReport }) {
  return (
    <dl className={styles.origin}>
      <OriginItem label="Origem:">
        <span className={styles.strong}>Chat pessoal</span>
      </OriginItem>
      <OriginItem label="Denunciado por:">
        <span className={styles.reporter}>{reporterOf(report)}</span>
      </OriginItem>
    </dl>
  );
}

type HeaderProps = Pick<ChatReportCardProps, 'report' | 'reportedUser'>;

function ChatReportHeader({ report, reportedUser }: HeaderProps) {
  const { accountAgeDays, warnings } = reportedUser;
  return (
    <header className={styles.cardHeader}>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name="person" size={18} />
      </span>
      <div className={styles.cardIdentity}>
        <h3 className={styles.author}>{reportedUser.name}</h3>
        <AuthorPills accountAgeDays={accountAgeDays} warnings={warnings} />
        <ChatOrigin report={report} />
      </div>
      <span className={styles.reason}>{report.reason}</span>
    </header>
  );
}

function Evidences({ report }: { report: GroupMessageReport }) {
  return (
    <ul className={styles.evidences} aria-label="Prints da conversa">
      {report.evidences.map(({ id }, index) => (
        <li key={id}>
          <EvidenceThumbnail reportId={report.id} evidenceId={id} position={index + 1} />
        </li>
      ))}
    </ul>
  );
}

const sanctionTargetOf = (report: GroupMessageReport, user: ReportedUser): SanctionTarget => ({
  id: user.id,
  name: user.name,
  username: user.username,
  warningsCount: user.warnings,
  reportId: report.id,
});

function ChatReportActions(props: ChatReportCardProps) {
  const { report, reportedUser, onAction, onSanctionAuthor } = props;
  const dismiss = () => onAction({ kind: 'report', action: 'dismiss', report });
  const sanction = () => onSanctionAuthor(sanctionTargetOf(report, reportedUser));
  return (
    <div className={styles.cardActions}>
      <button type="button" className={styles.dismiss} onClick={dismiss}>
        <Icon name="checkCircle" size={14} />
        Dispensar Denúncia
      </button>
      <button type="button" className={styles.sanctionAuthor} onClick={sanction}>
        <Icon name="block" size={14} />
        Aplicar sanção ao autor
      </button>
    </div>
  );
}

export function ChatReportCard(props: ChatReportCardProps) {
  const { report, reportedUser } = props;
  return (
    <article className={styles.card} aria-label={`Denúncia contra ${reportedUser.name}`}>
      <ChatReportHeader report={report} reportedUser={reportedUser} />
      {report.description && (
        <p className={styles.description}>
          <Icon name="shield" size={14} />
          {report.description}
        </p>
      )}
      <Evidences report={report} />
      <ChatReportActions {...props} />
    </article>
  );
}
