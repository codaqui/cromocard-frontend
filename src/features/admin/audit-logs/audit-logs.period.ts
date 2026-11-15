import type { SelectOption } from '@/components/Select/Select';

import type { AuditLogFilters } from './audit-logs.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const AUDIT_PERIOD_PRESETS = [
  'ALL',
  'TODAY',
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'CUSTOM',
] as const;

export type AuditPeriodPreset = (typeof AUDIT_PERIOD_PRESETS)[number];

export const DEFAULT_AUDIT_PERIOD: AuditPeriodPreset = 'LAST_7_DAYS';

export const auditPeriodOptions: SelectOption[] = [
  { value: 'ALL', label: 'Todo o período' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'LAST_7_DAYS', label: 'Últimos 7 dias' },
  { value: 'LAST_30_DAYS', label: 'Últimos 30 dias' },
  { value: 'CUSTOM', label: 'Intervalo personalizado' },
];

const DAYS_BY_PRESET: Partial<Record<AuditPeriodPreset, number>> = {
  TODAY: 1,
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
};

const brasiliaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BRASILIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export type DateRange = Pick<AuditLogFilters, 'from' | 'to'>;

export function toBrasiliaDate(instant: Date): string {
  return brasiliaDateFormatter.format(instant);
}

export function presetRange(preset: AuditPeriodPreset, now: Date): DateRange {
  const days = DAYS_BY_PRESET[preset];
  if (days === undefined) return { from: undefined, to: undefined };

  const start = new Date(now.getTime() - (days - 1) * DAY_IN_MS);
  return { from: toBrasiliaDate(start), to: toBrasiliaDate(now) };
}

export function toAuditPeriodPreset(value: string): AuditPeriodPreset {
  const preset = AUDIT_PERIOD_PRESETS.find((option) => option === value);
  return preset ?? DEFAULT_AUDIT_PERIOD;
}
