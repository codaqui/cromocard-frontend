import type { ComponentProps } from 'react';

import { Icon } from '@/components/Icon/Icon';

import { Calendar, type CalendarProps } from './Calendar';
import styles from './ScheduleSelector.module.css';

interface TimePickerProps {
  hourProps: ComponentProps<'input'>;
  minuteProps: ComponentProps<'input'>;
}

interface ScheduleSelectorProps extends CalendarProps, TimePickerProps {
  error?: string;
}

function TimePicker({ hourProps, minuteProps }: TimePickerProps) {
  return (
    <div className={styles.time}>
      <p className={styles.timeTitle}>Horário Exato de Liberação</p>
      <div className={styles.clock}>
        <label className={styles.unit}>
          <input inputMode="numeric" maxLength={2} {...hourProps} />
          <span>HORAS</span>
        </label>
        <span className={styles.separator} aria-hidden="true">
          :
        </span>
        <label className={styles.unit}>
          <input inputMode="numeric" maxLength={2} {...minuteProps} />
          <span>MINUTOS</span>
        </label>
      </div>
      <p className={styles.zone}>
        <span>Fuso horário:</span>
        <span className={styles.zoneValue}>UTC-03:00 (Brasília / SP)</span>
      </p>
    </div>
  );
}

/** Calendário e horário de liberação no fuso de Brasília (frame 277-2689, CCD100 R3). */
export function ScheduleSelector({
  hourProps,
  minuteProps,
  error,
  ...calendar
}: ScheduleSelectorProps) {
  return (
    <section className={styles.box} aria-labelledby="schedule-title">
      <h3 id="schedule-title" className={styles.title}>
        <Icon name="calendarMonth" size={20} />
        Configuração de agendamento
      </h3>
      <div className={styles.body}>
        <Calendar {...calendar} />
        <TimePicker hourProps={hourProps} minuteProps={minuteProps} />
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
