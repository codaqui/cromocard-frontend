const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const daysBetween = (date: Date, now: Date) =>
  Math.round((startOfDay(now) - startOfDay(date)) / DAY_IN_MS);

export type NotificationGroup = 'TODAY' | 'EARLIER';

export function groupOf(isoDate: string, now = new Date()): NotificationGroup {
  return daysBetween(new Date(isoDate), now) === 0 ? 'TODAY' : 'EARLIER';
}

function sameDayTime(elapsed: number): string {
  if (elapsed < MINUTE_IN_MS) return 'Agora';
  if (elapsed < HOUR_IN_MS) return `Há ${Math.floor(elapsed / MINUTE_IN_MS)} min`;
  return `Há ${Math.floor(elapsed / HOUR_IN_MS)} h`;
}

export function relativeTime(isoDate: string, now = new Date(), short = false): string {
  const date = new Date(isoDate);
  const days = daysBetween(date, now);
  if (days === 0) return sameDayTime(now.getTime() - date.getTime());
  if (days === 1) return short ? 'Ontem' : `Ontem, às ${timeFormatter.format(date)}`;
  return `${days} dias atrás`;
}

interface DatedItem {
  createdAt: string;
}

export interface GroupedItems<T> {
  group: NotificationGroup;
  items: T[];
}

export function groupByDay<T extends DatedItem>(
  items: readonly T[],
  { allRead, now = new Date() }: { allRead: boolean; now?: Date },
): GroupedItems<T>[] {
  const groupFor = (item: T): NotificationGroup =>
    allRead ? 'EARLIER' : groupOf(item.createdAt, now);
  return (['TODAY', 'EARLIER'] as const)
    .map((group) => ({ group, items: items.filter((item) => groupFor(item) === group) }))
    .filter(({ items: grouped }) => grouped.length > 0);
}

export function compactTime(isoDate: string, now = new Date()): string {
  const elapsed = now.getTime() - new Date(isoDate).getTime();
  if (elapsed < MINUTE_IN_MS) return 'agora';
  if (elapsed < HOUR_IN_MS) return `${Math.floor(elapsed / MINUTE_IN_MS)} min`;
  return relativeTime(isoDate, now, true);
}
