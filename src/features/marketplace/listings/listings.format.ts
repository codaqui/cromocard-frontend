const wholeCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const centsCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const EMPTY_VALUE = '—';

export function formatPrice(price: string | null): string {
  if (price === null) return EMPTY_VALUE;
  const value = Number(price);
  const formatter = Number.isInteger(value) ? wholeCurrency : centsCurrency;
  return formatter.format(value).replace(/\s/g, ' ');
}

export function initialsOf(username: string | null): string {
  return (username ?? '?').slice(0, 2).toUpperCase();
}
