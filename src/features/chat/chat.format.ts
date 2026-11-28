const DAY_IN_MS = 24 * 60 * 60 * 1000;
const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long' });

const capitalized = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const monthOf = (date: Date) => capitalized(monthFormat.format(date));

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

function daysBetween(date: Date, now: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(now) - start(date)) / DAY_IN_MS);
}

export function timeOf(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export const isToday = (iso: string, now = new Date()) => daysBetween(new Date(iso), now) === 0;

export function previewTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const days = daysBetween(date, now);
  if (days === 0) return timeOf(iso);
  if (days === 1) return 'Ontem';
  return `${date.getDate()} ${monthOf(date).slice(0, 3)}`;
}

export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const full = `${date.getDate()} de ${monthOf(date)}`;
  const days = daysBetween(date, now);
  if (days === 0) return `Hoje, ${full}`;
  return days === 1 ? `Ontem, ${full}` : full;
}

export const sameDay = (a: string, b: string) => dayKey(new Date(a)) === dayKey(new Date(b));

export const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();

export const handleOf = (username: string | null) => (username ? `@${username}` : '');

export const handleOrName = ({ username, name }: { username: string | null; name: string }) =>
  handleOf(username) || name;

export const listedLabel = (listed: number, total: number) =>
  total === 0
    ? 'Nenhuma conversa'
    : `${listed} de ${total} ${total === 1 ? 'conversa listada' : 'conversas listadas'}`;

export const activeLabel = (total: number) => `${total} ${total === 1 ? 'ativa' : 'ativas'}`;

export const initialsOf = (name: string) => {
  const words = name.trim().split(/\s+/);
  const last = words.length > 1 ? words.at(-1) : '';
  return `${words[0]?.charAt(0) ?? ''}${last?.charAt(0) ?? ''}`.toUpperCase();
};

export const commonGroupsLabel = (groups: readonly string[]) =>
  groups.length > 1 ? `${groups.length} grupos em comum` : (groups[0] ?? '');
