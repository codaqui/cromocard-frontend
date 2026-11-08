const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const GROUP_CODE_LENGTH = 6;

const countFormatter = new Intl.NumberFormat('pt-BR');

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: BRASILIA_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: BRASILIA_TIME_ZONE,
});

export function formatCount(value: number): string {
  return countFormatter.format(value);
}

export function formatMembers(count: number): string {
  return `${formatCount(count)} ${count === 1 ? 'membro' : 'membros'}`;
}

export function formatPendingCases(count: number): string {
  return `${formatCount(count)} ${count === 1 ? 'Caso Pendente' : 'Casos Pendentes'}`;
}

export function formatPendingAlerts(count: number): string {
  return `${formatCount(count)} ${count === 1 ? 'Pendente' : 'Pendentes'}`;
}

export function formatGroupCode(id: string): string {
  return `#GRP-${id.replaceAll('-', '').slice(-GROUP_CODE_LENGTH).toUpperCase()}`;
}

export function formatReportedAt(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  const day = dayFormatter.format(date);
  const label = day === dayFormatter.format(now) ? 'Hoje' : day;
  return `${label} às ${timeFormatter.format(date)}`;
}
