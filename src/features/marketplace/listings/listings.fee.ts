const PLATFORM_FEE_PERCENT = 5n;
const PERCENT_BASE = 100n;
const CENTS_PER_REAL = 100n;
const API_PRICE_FORMAT = /^(\d{1,8})(?:\.(\d{1,2}))?$/;

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export interface FeeBreakdown {
  platformFee: string;
  netAmount: string;
}

export function toApiPrice(typed: string): string {
  return typed
    .trim()
    .replace(/^R\$\s*/, '')
    .replace(/\./g, '')
    .replace(',', '.');
}

export function isValidApiPrice(price: string): boolean {
  const match = API_PRICE_FORMAT.exec(price);
  return Boolean(match) && Number(price) > 0;
}

function toCents(price: string): bigint {
  const withDecimals = price.includes('.') ? price : `${price}.`;
  const [reais, cents] = withDecimals.split('.') as [string, string];
  return BigInt(reais) * CENTS_PER_REAL + BigInt(cents.padEnd(2, '0'));
}

function formatCents(cents: bigint): string {
  return currencyFormatter.format(Number(cents) / Number(CENTS_PER_REAL));
}

export function feeBreakdownOf(typedPrice: string): FeeBreakdown | null {
  const price = toApiPrice(typedPrice);
  if (!isValidApiPrice(price)) return null;
  const priceCents = toCents(price);
  const feeCents = (priceCents * PLATFORM_FEE_PERCENT) / PERCENT_BASE;
  return { platformFee: formatCents(feeCents), netAmount: formatCents(priceCents - feeCents) };
}
