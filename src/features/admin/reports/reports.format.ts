import type { ExportFormat, ReportType } from './reports.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: BRASILIA_TIME_ZONE });

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BRASILIA_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const VALUE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  SELLER: 'Vendedor',
  ADMIN: 'Administrador',
  CARD: 'Carta',
  ALBUM: 'Álbum',
  UNDER_REVIEW: 'Em análise',
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;

export function formatReportCell(value: string | null | undefined): string {
  if (!value) return '—';
  if (ISO_DATE_TIME.test(value)) return dateFormatter.format(new Date(value));
  return VALUE_LABELS[value] ?? value;
}

export function reportFileName(
  type: ReportType,
  { from, to }: { from: string; to: string },
  format: ExportFormat,
): string {
  const day = (iso: string) => isoDateFormatter.format(new Date(iso));
  return `cromocard-${type}-${day(from)}-${day(to)}.${format}`;
}

export function formatDateRange(from: string, to: string): string {
  return `${dateFormatter.format(new Date(from))} a ${dateFormatter.format(new Date(to))}`;
}
