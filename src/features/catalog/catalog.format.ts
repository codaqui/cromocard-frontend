import { ApiError } from '@/lib/api-error';

import { EMPTY_VALUE_LABEL } from './catalog.labels';
import type { CatalogNotice } from './catalog.types';

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

const pluralOf = (count: number, one: string, many: string) =>
  `${formatCount(count)} ${count === 1 ? one : many}`;

/** "50 cartas importadas", com o arquivo na linha de baixo, como no frame 832-1683. */
export function importedCardsNotice(created: number, fileName: string): CatalogNotice {
  return {
    title: pluralOf(created, 'carta importada', 'cartas importadas'),
    detail: `O arquivo ${fileName} foi importado no catálogo.`,
  };
}

/** Colunas do modelo de CSV (L3), na ordem do arquivo. */
export const CARD_IMPORT_COLUMNS = 'album_title;number;name;rarity;language;category';

/** Linhas de cartas do CSV: as linhas preenchidas, sem o cabeçalho. */
export function csvDataRowsOf(text: string): number {
  const filled = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  return Math.max(filled.length - 1, 0);
}

const BYTES_PER_KB = 1024;
const sizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  const kb = Math.max(bytes / BYTES_PER_KB, 1);
  if (kb < BYTES_PER_KB) return `${Math.round(kb)} KB`;
  return `${sizeFormatter.format(kb / BYTES_PER_KB)} MB`;
}

/** "50 linhas • 12 KB • arraste outro arquivo para substituir", como no frame 832-3295. */
export function csvFileSummary(file: File, rows?: number): string {
  const rowsPart = rows === undefined ? [] : [pluralOf(rows, 'linha', 'linhas')];
  return [...rowsPart, formatFileSize(file.size), 'arraste outro arquivo para substituir'].join(
    ' • ',
  );
}

const LINE_FIELD = /^(\d+)\./;

const sentenceOf = (message: string) => {
  const text = message.charAt(0).toLowerCase() + message.slice(1);
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

/** Uma linha recusada do CSV, como no frame 832-3837: "Linha 12: a raridade não existe.". */
export function importErrorLine({ field, message }: { field: string; message: string }): string {
  const line = LINE_FIELD.exec(field)?.[1];
  return `${line ? `Linha ${line}` : 'Arquivo'}: ${sentenceOf(message)}`;
}

function failedLinesOf(error: Error): number {
  const details = error instanceof ApiError ? (error.details ?? []) : [];
  const lines = details.flatMap(({ field }) => LINE_FIELD.exec(field)?.slice(1, 2) ?? []);
  return new Set(lines).size;
}

/** Resumo da importação recusada, como no frame 832-3837. */
export function failedImportSummary(fileName: string | undefined, error: Error): string {
  const lines = failedLinesOf(error);
  if (!fileName || lines === 0) return error.message;
  const withError = pluralOf(lines, 'linha', 'linhas');
  return `O arquivo ${fileName} tem ${withError} com erro. Corrija as linhas abaixo e envie o arquivo de novo.`;
}
