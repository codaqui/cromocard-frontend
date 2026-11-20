import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

import { formatScheduleNotice } from '../../global-notifications.format';
import type { GlobalNotification } from '../../global-notifications.types';

interface CancelScheduleDialogProps {
  dispatch: GlobalNotification | null;
  isCanceling: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const BRASILIA_PARTS: Intl.DateTimeFormatOptions = {
  timeZone: 'America/Sao_Paulo',
  hourCycle: 'h23',
};

function scheduleOf(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat('en-CA', { ...BRASILIA_PARTS, dateStyle: 'short' }).format(
    date,
  );
  const time = new Intl.DateTimeFormat('pt-BR', { ...BRASILIA_PARTS, timeStyle: 'short' }).format(
    date,
  );
  return formatScheduleNotice(day, time);
}

export function CancelScheduleDialog({
  dispatch,
  isCanceling,
  errorMessage,
  onConfirm,
  onClose,
}: CancelScheduleDialogProps) {
  return (
    <ConfirmDialog
      open={dispatch !== null}
      title="Cancelar agendamento?"
      message={
        dispatch?.scheduledAt &&
        `A notificação "${dispatch.title}", programada para ${scheduleOf(dispatch.scheduledAt)}, não será enviada. Agendamentos não podem ser editados: para mudar, cancele e crie outro.`
      }
      confirmLabel="Cancelar agendamento"
      cancelLabel="Voltar"
      tone="danger"
      isConfirming={isCanceling}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
