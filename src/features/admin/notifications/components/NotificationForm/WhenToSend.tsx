import { Icon } from '@/components/Icon/Icon';

import { todayInBrasilia } from '../../global-notifications.format';
import type { NotificationFormState } from '../../hooks/useNotificationForm';
import { OptionCard } from '../OptionCard/OptionCard';
import { ScheduleSelector } from '../ScheduleSelector/ScheduleSelector';
import styles from './NotificationForm.module.css';
import { OptionGroup } from './OptionGroup';

const scheduleErrorOf = ({ errors }: NotificationFormState) =>
  errors.scheduleDay?.message ??
  (errors.scheduleHour || errors.scheduleMinute ? 'Informe um horário válido.' : undefined);

function Schedule({ form }: { form: NotificationFormState }) {
  const { register, values, setDay } = form;
  return (
    <ScheduleSelector
      day={values.scheduleDay}
      minDay={todayInBrasilia()}
      onDayChange={setDay}
      hourProps={{ 'aria-label': 'Horas', ...register('scheduleHour') }}
      minuteProps={{ 'aria-label': 'Minutos', ...register('scheduleMinute') }}
      error={scheduleErrorOf(form)}
    />
  );
}

/** Disparo imediato ou agendado (CCD100 R2). */
export function WhenToSend({ form }: { form: NotificationFormState }) {
  return (
    <>
      <OptionGroup legend="Quando enviar">
        <OptionCard
          type="radio"
          value="NOW"
          label="Disparo Imediato"
          hint="Envia assim que você confirmar"
          {...form.register('when')}
        />
        <OptionCard
          type="radio"
          value="SCHEDULED"
          label="Agendar Horário"
          hint="Escolha dia e horário (Brasília)"
          icon={<Icon name="schedule" size={14} />}
          className={styles.scheduleOption}
          {...form.register('when')}
        />
      </OptionGroup>
      {form.values.when === 'SCHEDULED' && <Schedule form={form} />}
    </>
  );
}
