const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

const numberFormatter = new Intl.NumberFormat('pt-BR');

const brasiliaPart = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: BRASILIA_TIME_ZONE });

const dayFormatter = brasiliaPart({ day: '2-digit' });
const shortMonthNameFormatter = brasiliaPart({ month: 'short' });
const yearFormatter = brasiliaPart({ year: 'numeric' });

const monthNameFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });

const shortMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
});

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatCount = (value: number | null) =>
  value === null ? '—' : numberFormatter.format(value);

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export const formatPercent = (ratio: number) => percentFormatter.format(ratio);

export const formatShare = (part: number, whole: number) =>
  formatPercent(whole === 0 ? 0 : part / whole);

function dateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: dayFormatter.format(date),
    month: capitalize(shortMonthNameFormatter.format(date).replace('.', '')),
    year: yearFormatter.format(date),
  };
}

export function formatPeriodRange(from: string, to: string): string {
  const start = dateParts(from);
  const end = dateParts(to);
  const startYear = start.year === end.year ? '' : `, ${start.year}`;
  return `${start.day} ${start.month}${startYear} - ${end.day} ${end.month}, ${end.year}`;
}

const monthDate = (month: string) => new Date(`${month}-01T00:00:00Z`);

export const monthName = (month: string) => monthNameFormatter.format(monthDate(month));

export const shortMonthLabel = (month: string) =>
  shortMonthFormatter.format(monthDate(month)).replace(' de ', '/');
