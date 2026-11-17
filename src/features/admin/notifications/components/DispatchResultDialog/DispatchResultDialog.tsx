import type { ReactNode } from 'react';

import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';

import { formatScheduleDate, usersLabel } from '../../global-notifications.format';
import { AUDIENCE_LABELS, channelsLabel } from '../../global-notifications.labels';
import type { GlobalNotification } from '../../global-notifications.types';
import styles from './DispatchResultDialog.module.css';

interface DispatchResultDialogProps {
  dispatch: GlobalNotification | null;
  onSeeHistory: () => void;
  onClose: () => void;
}

const COPY = {
  sent: {
    title: 'Notificação enviada',
    message: 'A notificação já está na central de notificações dos usuários do público escolhido.',
    status: 'ENTREGUE',
  },
  scheduled: {
    title: 'Notificação agendada',
    message:
      'A notificação entrou na fila e vai ser enviada no horário programado. Os destinatários são calculados na hora do envio.',
    status: 'NA FILA',
  },
};

function SummaryItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? styles.itemWide : styles.item}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SummaryItems({ dispatch }: { dispatch: GlobalNotification }) {
  const first =
    dispatch.status === 'SCHEDULED' ? (
      <SummaryItem label="ENVIO PROGRAMADO" value={formatScheduleDate(dispatch.scheduledAt!)} />
    ) : (
      <SummaryItem
        label="DESTINATÁRIOS"
        value={<span className={styles.mono}>{usersLabel(dispatch.recipientCount)}</span>}
      />
    );
  const channels = (
    <span className={styles.channels}>
      {channelsLabel(dispatch.channels)}
      <Icon name="bolt" size={16} />
    </span>
  );
  return (
    <dl className={styles.items}>
      {first}
      <SummaryItem label="CANAIS" value={channels} />
      <SummaryItem label="TÍTULO" value={dispatch.title} wide />
      <SummaryItem label="PÚBLICO" value={AUDIENCE_LABELS[dispatch.audience]} wide />
    </dl>
  );
}

function Summary({ dispatch, status }: { dispatch: GlobalNotification; status: string }) {
  return (
    <section className={styles.summary} aria-label="Resumo do envio">
      <div className={styles.summaryTop}>
        <span className={styles.summaryTitle}>
          <Icon name="shield" size={18} />
          RESUMO DO ENVIO
        </span>
        <span className={styles.status}>
          STATUS: <strong>{status}</strong>
        </span>
      </div>
      <SummaryItems dispatch={dispatch} />
    </section>
  );
}

function ResultActions({ onSeeHistory, onClose }: Omit<DispatchResultDialogProps, 'dispatch'>) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onSeeHistory}>
        <Icon name="history" size={18} />
        Ver histórico de disparos
      </Button>
      <Button onClick={onClose}>
        Voltar à central
        <Icon name="arrowForward" size={18} />
      </Button>
    </div>
  );
}

const badge = (
  <span className={styles.badge} aria-hidden="true">
    <Icon name="check" size={28} />
  </span>
);

/** Modal de sucesso: enviada (frame 277-2982) ou agendada (frame 821-1118). */
export function DispatchResultDialog({ dispatch, ...actions }: DispatchResultDialogProps) {
  const copy = dispatch?.status === 'SCHEDULED' ? COPY.scheduled : COPY.sent;
  return (
    <Modal
      open={dispatch !== null}
      title={copy.title}
      subtitle={copy.message}
      onClose={actions.onClose}
      size="medium"
      variant="compact"
      eyebrow={badge}
      footer={<ResultActions {...actions} />}
    >
      {dispatch && <Summary dispatch={dispatch} status={copy.status} />}
    </Modal>
  );
}
