const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

export function formatLastAccess(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  const time = timeFormatter.format(date);
  const diff = daysBetween(now, date);

  if (diff === 0) return `Hoje, ${time}`;
  if (diff === 1) return `Ontem, ${time}`;

  return dateFormatter.format(date);
}
