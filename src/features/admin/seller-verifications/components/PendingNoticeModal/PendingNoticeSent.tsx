import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { userDetailPathFor } from '@/routes/paths';
import { formatDateTime } from '@/utils/formatDate';

import { pendingNoticeChannelLabels } from '../../seller-verifications.labels';
import type { PendingNoticeResult, PendingNoticeTarget } from '../../seller-verifications.types';
import styles from './PendingNoticeModal.module.css';

const EMAIL_SUBJECT = 'Pendência no seu cadastro de vendedor — CromoCard';

interface PendingNoticeSentProps {
  target: PendingNoticeTarget;
  result: PendingNoticeResult;
  message: string;
  onBackToDashboard: () => void;
}

const channelsLabel = (result: PendingNoticeResult) =>
  result.channels.map((channel) => pendingNoticeChannelLabels[channel]).join(' & ');

function SentSummary({ target, result }: Pick<PendingNoticeSentProps, 'target' | 'result'>) {
  const rows = [
    ['Destinatário', target.sellerName],
    ['Assunto', EMAIL_SUBJECT],
    ['Canais', channelsLabel(result)],
    ['Horário de envio', formatDateTime(result.sentAt)],
  ];

  return (
    <dl className={styles.summary}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.summaryRow}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function MessagePreview({ message }: { message: string }) {
  return (
    <figure className={styles.preview}>
      <figcaption className={styles.previewLabel}>
        <Icon name="forum" size={14} />
        Prévia do conteúdo
      </figcaption>
      <blockquote className={styles.previewText}>“{message}”</blockquote>
    </figure>
  );
}

function SentActions({
  sellerId,
  onBackToDashboard,
}: {
  sellerId: string;
  onBackToDashboard: () => void;
}) {
  return (
    <div className={styles.sentActions}>
      <Button onClick={onBackToDashboard}>
        <Icon name="chevronLeft" size={16} />
        Voltar ao Dashboard
      </Button>
      <Link to={userDetailPathFor(sellerId)} className={styles.profileLink}>
        Ver perfil do lojista
        <Icon name="chevronRight" size={16} />
      </Link>
    </div>
  );
}

function DeliveryStatus({ emailDelivered }: { emailDelivered: boolean }) {
  return (
    <p className={styles.deliveryStatus}>
      Status:{' '}
      <span className={emailDelivered ? styles.delivered : styles.notDelivered}>
        {emailDelivered ? 'Entregue' : 'E-mail não entregue'}
      </span>
    </p>
  );
}

export function PendingNoticeSent({
  target,
  result,
  message,
  onBackToDashboard,
}: PendingNoticeSentProps) {
  return (
    <div className={styles.sent}>
      {!result.emailDelivered && (
        <p className={styles.emailWarning} role="alert">
          O e-mail não foi entregue; a notificação no site foi criada normalmente.
        </p>
      )}
      <SentSummary target={target} result={result} />
      <MessagePreview message={message} />
      <SentActions sellerId={target.sellerId} onBackToDashboard={onBackToDashboard} />
      <DeliveryStatus emailDelivered={result.emailDelivered} />
    </div>
  );
}
