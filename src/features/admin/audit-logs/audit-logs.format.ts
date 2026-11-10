const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const DAYS_IN_KPI_WINDOW = 30;
const SHORT_ID_LENGTH = 8;

const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: BRASILIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

const countFormatter = new Intl.NumberFormat('pt-BR');

const averageFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface AuditDateTime {
  dateTime: string;
  milliseconds: string;
}

export function formatAuditDateTime(isoDate: string): AuditDateTime {
  const date = new Date(isoDate);
  return {
    dateTime: dateTimeFormatter.format(date),
    milliseconds: String(date.getUTCMilliseconds()).padStart(3, '0'),
  };
}

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatDailyAverage(last30Days: number): string {
  return averageFormatter.format(last30Days / DAYS_IN_KPI_WINDOW);
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function shortId(id: string): string {
  return `${id.slice(0, SHORT_ID_LENGTH)}…`;
}

export function reasonOf(details: Record<string, unknown> | null): string | null {
  const reason = details?.reason;
  return typeof reason === 'string' ? reason : null;
}
