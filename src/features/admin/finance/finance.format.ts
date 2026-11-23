import type { MovementType } from './finance.types';

const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';
const ORDER_CODE_LENGTH = 5;

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const countFormatter = new Intl.NumberFormat('pt-BR');

const brasilia = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: BRASILIA_TIME_ZONE });

const hourFormatter = brasilia({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const dayFormatter = brasilia({ day: 'numeric' });
const monthFormatter = brasilia({ month: 'short' });
const yearFormatter = brasilia({ year: 'numeric' });

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  PAYMENT: 'Pagamento recebido',
  RELEASE: 'Liberação ao vendedor',
};

export const formatCurrency = (cents: number) => currencyFormatter.format(cents / 100);

export function splitCurrency(cents: number): { whole: string; fraction: string } {
  const formatted = formatCurrency(cents);
  const comma = formatted.lastIndexOf(',');
  return { whole: formatted.slice(0, comma), fraction: formatted.slice(comma) };
}

export const formatCount = (value: number) => countFormatter.format(value);

export const formatLedgerTime = (iso: string) =>
  hourFormatter.format(new Date(iso)).replace(':', 'h');

export function formatLedgerDay(iso: string): string {
  const date = new Date(iso);
  const month = capitalize(monthFormatter.format(date).replace('.', ''));
  return `${dayFormatter.format(date)} ${month}, ${yearFormatter.format(date)}`;
}

export const orderCode = (orderId: string) =>
  `#PED-${orderId.replaceAll('-', '').slice(-ORDER_CODE_LENGTH).toUpperCase()}`;
