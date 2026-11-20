export interface CalendarDay {
  iso: string;
  day: number;
  inMonth: boolean;
}

const DAYS_IN_WEEK = 7;
const pad = (value: number) => String(value).padStart(2, '0');
const isoOf = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const firstDayOf = (month: string) => new Date(`${month}-01T00:00:00Z`);

export const monthOf = (day: string) => day.slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const date = firstDayOf(month);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return isoOf(date).slice(0, 7);
}

export function monthLabel(month: string): string {
  const text = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric',
  }).format(firstDayOf(month));
  const label = text.replace(' de ', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthGrid(month: string): CalendarDay[][] {
  const first = firstDayOf(month);
  const cursor = new Date(first);
  cursor.setUTCDate(1 - first.getUTCDay());
  const weeks: CalendarDay[][] = [];

  do {
    const week = Array.from({ length: DAYS_IN_WEEK }, () => {
      const day = {
        iso: isoOf(cursor),
        day: cursor.getUTCDate(),
        inMonth: monthOf(isoOf(cursor)) === month,
      };
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      return day;
    });
    weeks.push(week);
  } while (monthOf(isoOf(cursor)) === month);

  return weeks;
}
