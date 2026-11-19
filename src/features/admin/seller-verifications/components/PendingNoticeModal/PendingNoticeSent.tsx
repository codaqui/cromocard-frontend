import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={styles.recipientLabel}>{label}</p>
      <p className={styles.recipientValue}>{value}</p>
    </div>
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
      <Button variant="secondary" onClick={onBackToDashboard}>
        Voltar ao Dashboard
      </Button>
      <Link to={userDetailPathFor(sellerId)} className={styles.profileLink}>
        Ver perfil do lojista
      </Link>
    </div>
  );
}

const channelsLabel = (result: PendingNoticeResult) =>
  result.channels.map((channel) => pendingNoticeChannelLabels[channel]).join(' e ');

export function PendingNoticeSent({
  target,
  result,
  message,
  onBackToDashboard,
}: PendingNoticeSentProps) {
  return (
    <div className={styles.sent}>
      <Field label="Destinatário" value={`${target.sellerName} · ${target.sellerEmail}`} />
      <Field label="Assunto" value={EMAIL_SUBJECT} />
      <Field label="Canais" value={channelsLabel(result)} />
      <Field label="Horário" value={formatDateTime(result.sentAt)} />
      {!result.emailDelivered && (
        <p className={styles.emailWarning} role="alert">
          O e-mail não foi entregue; a notificação no site foi criada normalmente.
        </p>
      )}
      <Field label="Prévia da mensagem" value={message} />
      <SentActions sellerId={target.sellerId} onBackToDashboard={onBackToDashboard} />
    </div>
  );
}
