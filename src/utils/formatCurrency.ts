export const EMPTY_VALUE = '—';

const wholeCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const centsCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCurrency(amount: string | null): string {
  if (amount === null) return EMPTY_VALUE;
  const value = Number(amount);
  const formatter = Number.isInteger(value) ? wholeCurrency : centsCurrency;
  return formatter.format(value);
}
