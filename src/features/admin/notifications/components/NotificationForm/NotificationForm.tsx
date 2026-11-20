import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';

import { usersLabel } from '../../global-notifications.format';
import type { RecipientsCount } from '../../global-notifications.types';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import { AudienceField, ChannelsField } from './AudienceFields';
import { MessageFields } from './MessageFields';
import styles from './NotificationForm.module.css';
import { SendNotice } from './SendNotice';
import { WhenToSend } from './WhenToSend';

interface NotificationFormProps {
  form: NotificationFormState;
  counts?: RecipientsCount;
  isSending: boolean;
}

function FormActions({ form, counts, isSending }: NotificationFormProps) {
  const action = form.values.when === 'SCHEDULED' ? 'Agendar notificação' : 'Enviar notificação';
  const label = counts ? `${action} para ${usersLabel(counts[form.values.audience])}` : action;
  return (
    <>
      {form.formError && <FormError message={form.formError} />}
      <Button type="submit" className={styles.submit} disabled={isSending}>
        <Icon name="rocket" size={22} />
        <span>{label}</span>
      </Button>
      <Button
        variant="secondary"
        className={styles.cancel}
        onClick={form.clear}
        disabled={isSending}
      >
        Cancelar
      </Button>
    </>
  );
}

export function NotificationForm(props: NotificationFormProps) {
  const { form, counts } = props;
  const recipients = counts ? usersLabel(counts[form.values.audience]) : 'todo o público';
  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={form.submit}
      aria-labelledby="new-notification"
    >
      <h2 id="new-notification" className={styles.heading}>
        <Icon name="editNote" size={22} />
        Nova notificação
      </h2>
      <MessageFields form={form} />
      <AudienceField form={form} counts={counts} />
      <ChannelsField form={form} />
      <WhenToSend form={form} />
      <SendNotice form={form} recipients={recipients} />
      <FormActions {...props} />
    </form>
  );
}
