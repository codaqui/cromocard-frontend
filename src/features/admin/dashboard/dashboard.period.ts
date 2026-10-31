import type { Period } from '@/components/PeriodFilter/PeriodFilter';

import type { DashboardPeriodParams } from './dashboard.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_DASHBOARD_PERIOD: Period = { preset: '30d' };

function brasiliaOffsetInMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: BRASILIA_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const zonedAsUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  );
  return zonedAsUtc - instant.getTime();
}

function startOfBrasiliaDay(date: string): Date {
  const utcMidnight = new Date(`${date}T00:00:00Z`);
  return new Date(utcMidnight.getTime() - brasiliaOffsetInMs(utcMidnight));
}

function endOfBrasiliaDay(date: string): Date {
  const nextDay = new Date(new Date(`${date}T00:00:00Z`).getTime() + DAY_IN_MS);
  return new Date(startOfBrasiliaDay(nextDay.toISOString().slice(0, 10)).getTime() - 1);
}

export function toPeriodParams(period: Period): DashboardPeriodParams {
  if ('preset' in period) return { period: period.preset };

  return {
    from: startOfBrasiliaDay(period.from).toISOString(),
    to: endOfBrasiliaDay(period.to).toISOString(),
  };
}
