import { useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import { formatLongDay } from '../../global-notifications.format';
import { monthGrid, monthLabel, monthOf, shiftMonth } from './calendar-days';
import styles from './ScheduleSelector.module.css';

const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export interface CalendarProps {
  day: string;
  minDay: string;
  onDayChange: (day: string) => void;
}

interface MonthNavProps {
  month: string;
  minDay: string;
  onMonthChange: (month: string) => void;
}

function MonthNav({ month, minDay, onMonthChange }: MonthNavProps) {
  return (
    <div className={styles.calendarTop}>
      <span className={styles.month}>{monthLabel(month)}</span>
      <span className={styles.monthNav}>
        <button
          type="button"
          aria-label="Mês anterior"
          disabled={month <= monthOf(minDay)}
          onClick={() => onMonthChange(shiftMonth(month, -1))}
        >
          <Icon name="chevronLeft" size={18} />
        </button>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </span>
    </div>
  );
}

function MonthDays({ month, day, minDay, onDayChange }: CalendarProps & { month: string }) {
  return (
    <tbody>
      {monthGrid(month).map((week) => (
        <tr key={week[0]?.iso}>
          {week.map((cell) => (
            <td key={cell.iso}>
              <button
                type="button"
                className={cn(styles.day, cell.iso === day && styles.selected)}
                aria-pressed={cell.iso === day}
                aria-label={formatLongDay(cell.iso)}
                disabled={!cell.inMonth || cell.iso < minDay}
                onClick={() => onDayChange(cell.iso)}
              >
                {cell.day}
              </button>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function Calendar(props: CalendarProps) {
  const [month, setMonth] = useState(() => monthOf(props.day));
  return (
    <div className={styles.calendar}>
      <MonthNav month={month} minDay={props.minDay} onMonthChange={setMonth} />
      <table className={styles.grid}>
        <thead>
          <tr>
            {WEEK_DAYS.map((weekDay) => (
              <th key={weekDay} scope="col">
                {weekDay}
              </th>
            ))}
          </tr>
        </thead>
        <MonthDays {...props} month={month} />
      </table>
      <p className={styles.selectedDay}>
        <span>Dia Selecionado:</span>
        <strong>{formatLongDay(props.day)}</strong>
      </p>
    </div>
  );
}
