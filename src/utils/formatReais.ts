import { EMPTY_VALUE } from './emptyValue';

const wholeCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const centsCurrency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valor em reais, como a API manda (`"1750.00"`); para centavos, use o formatador do domínio. */
export function formatReais(amount: string | null): string {
  if (amount === null) return EMPTY_VALUE;
  const value = Number(amount);
  const formatter = Number.isInteger(value) ? wholeCurrency : centsCurrency;
  return formatter.format(value);
}
