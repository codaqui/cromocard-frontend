const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function daysBetween(date: Date, now: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(now) - start(date)) / 86_400_000);
}

export function timeOf(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function previewTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const days = daysBetween(date, now);
  if (days === 0) return timeOf(iso);
  if (days === 1) return 'Ontem';
  return `${date.getDate()} ${MONTHS[date.getMonth()]?.slice(0, 3)}`;
}

export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const full = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
  const days = daysBetween(date, now);
  if (days === 0) return `Hoje, ${full}`;
  return days === 1 ? `Ontem, ${full}` : full;
}

export const sameDay = (a: string, b: string) => dayKey(new Date(a)) === dayKey(new Date(b));

export const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();

export const handleOf = (username: string | null) => (username ? `@${username}` : '');

export const listedLabel = (listed: number, total: number) =>
  total === 0
    ? 'Nenhuma conversa'
    : `${listed} de ${total} ${total === 1 ? 'conversa listada' : 'conversas listadas'}`;

export const activeLabel = (total: number) => `${total} ${total === 1 ? 'ativa' : 'ativas'}`;
