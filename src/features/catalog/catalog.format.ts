import { EMPTY_VALUE_LABEL } from './catalog.labels';

const countFormatter = new Intl.NumberFormat('pt-BR');
const ALBUM_NUMBER_DIGITS = 3;

export function formatCount(value?: number): string {
  return value === undefined ? EMPTY_VALUE_LABEL : countFormatter.format(value);
}

export function formatAlbumNumber(number: string): string {
  return /^\d+$/.test(number) ? number.padStart(ALBUM_NUMBER_DIGITS, '0') : number;
}

interface Edition {
  publisher: string | null;
  year: number | null;
}

export function formatEdition({ publisher, year }: Edition): string | null {
  if (publisher && year) return `${publisher} (${year})`;
  return publisher ?? (year ? String(year) : null);
}
