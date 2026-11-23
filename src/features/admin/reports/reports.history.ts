import { formatDateRange } from './reports.format';
import { presetLabel, REPORT_CARDS } from './reports.labels';
import type { ReportExport, ReportPeriodParams } from './reports.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * KILOBYTE;
const CODE_LENGTH = 4;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: BRASILIA_TIME_ZONE });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRASILIA_TIME_ZONE,
  dateStyle: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRASILIA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const sizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

const dayOf = (date: Date) => dayFormatter.format(date);

export function exportCode(id: string): string {
  return `#REP-${id.slice(-CODE_LENGTH).toUpperCase()}`;
}

export function reportTitle(type: ReportExport['type']): string {
  return REPORT_CARDS.find((card) => card.type === type)?.title ?? type;
}

export function exportPeriodLabel({ filters }: ReportExport): string {
  if (filters.period) return presetLabel(filters.period);
  return formatDateRange(filters.from, filters.to);
}

function dayLabel(date: Date, now: Date): string {
  const yesterday = new Date(now.getTime() - DAY_IN_MS);
  if (dayOf(date) === dayOf(now)) return 'Hoje';
  if (dayOf(date) === dayOf(yesterday)) return 'Ontem';
  return dateFormatter.format(date);
}

export function formatExportedAt(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  return `${dayLabel(date, now)} · ${timeFormatter.format(date)}`;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < KILOBYTE) return `${bytes} B`;
  if (bytes < MEGABYTE) return `${sizeFormatter.format(bytes / KILOBYTE)} KB`;
  return `${sizeFormatter.format(bytes / MEGABYTE)} MB`;
}

export function formatAvailableUntil(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function exportParamsOf({ filters }: ReportExport): ReportPeriodParams {
  if (filters.period) return { period: filters.period };
  return { from: filters.from, to: filters.to };
}

export function requesterLabel({ requestedBy }: ReportExport): string {
  return requestedBy.username ? `@${requestedBy.username}` : requestedBy.name;
}
