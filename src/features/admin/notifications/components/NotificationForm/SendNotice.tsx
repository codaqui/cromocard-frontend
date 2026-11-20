import { Icon } from '@/components/Icon/Icon';

import { formatScheduleNotice } from '../../global-notifications.format';
import { channelPlaces } from '../../global-notifications.labels';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import styles from './NotificationForm.module.css';

function noticeOf({ values, hasErrors }: NotificationFormState, recipients: string) {
  if (hasErrors) return 'Corrija os campos destacados para continuar.';
  const places = channelPlaces(values.channels);
  if (values.when === 'NOW') {
    return `A notificação vai para ${places} de ${recipients} e não pode ser desfeita.`;
  }
  const time = `${values.scheduleHour}:${values.scheduleMinute}`;
  const when = formatScheduleNotice(values.scheduleDay, time);
  return `A notificação entra na fila e vai para ${places} de ${recipients} em ${when}.`;
}

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
