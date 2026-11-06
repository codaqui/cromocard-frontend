const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

const numberFormatter = new Intl.NumberFormat('pt-BR');

const dayMonthFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: BRASILIA_TIME_ZONE,
});

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

export const formatShare = (part: number, whole: number) =>
  percentFormatter.format(whole === 0 ? 0 : part / whole);

function dateParts(iso: string) {
  const parts = dayMonthFormatter.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return {
    day: part('day'),
    month: capitalize(part('month').replace('.', '')),
    year: part('year'),
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
