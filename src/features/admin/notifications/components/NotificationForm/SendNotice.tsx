import { Icon } from '@/components/Icon/Icon';

import { formatScheduleNotice } from '../../global-notifications.format';
import { NOTIFICATION_CHANNELS, type NotificationChannel } from '../../global-notifications.types';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import styles from './NotificationForm.module.css';

const CHANNEL_PLACES: Record<NotificationChannel, string> = {
  IN_APP: 'a central de notificações',
  EMAIL: 'o e-mail',
};

const placesOf = (channels: NotificationChannel[]) =>
  NOTIFICATION_CHANNELS.filter((channel) => channels.includes(channel))
    .map((channel) => CHANNEL_PLACES[channel])
    .join(' e ') || CHANNEL_PLACES.IN_APP;

function noticeOf({ values, hasErrors }: NotificationFormState, recipients: string) {
  if (hasErrors) return 'Corrija os campos destacados para continuar.';
  const places = placesOf(values.channels);
  if (values.when === 'NOW') {
    return `A notificação vai para ${places} de ${recipients} e não pode ser desfeita.`;
  }
  const time = `${values.scheduleHour}:${values.scheduleMinute}`;
  const when = formatScheduleNotice(values.scheduleDay, time);
  return `A notificação entra na fila e vai para ${places} de ${recipients} em ${when}.`;
}

/** Aviso "Antes de enviar" com a quantidade de destinatários (CCD060 R18). */
export function SendNotice({
  form,
  recipients,
}: {
  form: NotificationFormState;
  recipients: string;
}) {
  return (
    <div className={styles.notice} role="status">
      <Icon name="warning" size={22} />
      <div>
        <p className={styles.noticeTitle}>Antes de enviar</p>
        <p>{noticeOf(form, recipients)}</p>
      </div>
    </div>
  );
}
