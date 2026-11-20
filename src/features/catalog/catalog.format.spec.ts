import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';

import {
  csvDataRowsOf,
  csvFileSummary,
  failedImportSummary,
  formatAlbumNumber,
  formatCount,
  formatEdition,
  formatFileSize,
  importedCardsNotice,
  importErrorLine,
  bulkDeletedNotice,
  bulkDeleteMessage,
  bulkDeleteTitle,
  joinNames,
} from './catalog.format';

const KB = 1024;

function csvError(fields: string[]) {
  return new ApiError({
    status: 422,
    code: 'CSV_INVALID',
    message: 'O arquivo tem linhas com erro',
    details: fields.map((field) => ({ field, message: 'inválido' })),
  });
}

describe('catalog.format', () => {
  it('formata contagens em pt-BR e usa travessão sem valor', () => {
    expect(formatCount(184350)).toBe('184.350');
    expect(formatCount(undefined)).toBe('—');
  });

  it('completa o número da carta com zeros só quando é numérico', () => {
    expect(formatAlbumNumber('4')).toBe('004');
    expect(formatAlbumNumber('1024')).toBe('1024');
    expect(formatAlbumNumber('10a')).toBe('10a');
  });

  it('junta editora e ano e aceita só um dos dois', () => {
    expect(formatEdition({ publisher: 'Panini', year: 2026 })).toBe('Panini (2026)');
    expect(formatEdition({ publisher: 'Panini', year: null })).toBe('Panini');
    expect(formatEdition({ publisher: null, year: 2026 })).toBe('2026');
    expect(formatEdition({ publisher: null, year: null })).toBeNull();
  });
});

describe('catalog.format: importação de CSV', () => {
  it('R13: mostra a linha do erro do CSV numa frase, como no frame 832-3837', () => {
    expect(
      importErrorLine({ field: '12.rarity', message: '"Ultra" não existe em raridades' }),
    ).toBe('Linha 12: "Ultra" não existe em raridades.');
    expect(importErrorLine({ field: '41.name', message: 'Informe o nome da carta.' })).toBe(
      'Linha 41: informe o nome da carta.',
    );
  });

  it('R13: erro do arquivo inteiro, como o cabeçalho errado, não mostra linha', () => {
    expect(importErrorLine({ field: 'file', message: 'O arquivo não tem nenhuma carta' })).toBe(
      'Arquivo: o arquivo não tem nenhuma carta.',
    );
  });

  it('R13: o aviso de sucesso usa singular e plural e cita o arquivo', () => {
    expect(importedCardsNotice(1, 'uma.csv')).toEqual({
      title: '1 carta importada',
      detail: 'O arquivo uma.csv foi importado no catálogo.',
    });
    expect(importedCardsNotice(1500, 'base.csv').title).toBe('1.500 cartas importadas');
  });

  it('R13: conta as linhas de cartas sem o cabeçalho e sem linhas em branco', () => {
    expect(csvDataRowsOf('album_title;number\r\nBase;1\r\nBase;2\r\n\r\n')).toBe(2);
    expect(csvDataRowsOf('album_title;number\n')).toBe(0);
    expect(csvDataRowsOf('')).toBe(0);
  });

  it('R13: mostra o tamanho do arquivo em KB ou MB', () => {
    expect(formatFileSize(10)).toBe('1 KB');
    expect(formatFileSize(12 * KB)).toBe('12 KB');
    expect(formatFileSize(1.25 * KB * KB)).toBe('1,3 MB');
  });

  it('R13: resume o arquivo escolhido, com as linhas quando já foram contadas', () => {
    const file = new File(['x'.repeat(12 * KB)], 'base.csv');

    expect(csvFileSummary(file, 50)).toBe(
      '50 linhas • 12 KB • arraste outro arquivo para substituir',
    );
    expect(csvFileSummary(file)).toBe('12 KB • arraste outro arquivo para substituir');
  });

  it('R13: resume a importação recusada pelo número de linhas com erro', () => {
    const error = csvError(['12.rarity', '27.number', '27.name']);

    expect(failedImportSummary('base.csv', error)).toBe(
      'O arquivo base.csv tem 2 linhas com erro. Corrija as linhas abaixo e envie o arquivo de novo.',
    );
    expect(failedImportSummary('base.csv', csvError(['3.name']))).toContain('tem 1 linha com erro');
  });

  it('R13: sem linhas com erro, como no cabeçalho errado, mostra a mensagem da API', () => {
    expect(failedImportSummary('base.csv', csvError(['file']))).toBe(
      'O arquivo tem linhas com erro',
    );
    expect(failedImportSummary(undefined, new Error('Falha de rede'))).toBe('Falha de rede');
  });
});

describe('exclusão em lote (CCD105)', () => {
  it('R10: junta os nomes como no Figma', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['Gyarados'])).toBe('Gyarados');
    expect(joinNames(['Gyarados', 'Ninetales', 'Zapdos'])).toBe('Gyarados, Ninetales e Zapdos');
  });

  it('R10: título e mensagem no singular e no plural', () => {
    expect(bulkDeleteTitle(1)).toBe('Excluir 1 carta');
    expect(bulkDeleteTitle(3)).toBe('Excluir 3 cartas');
    expect(bulkDeleteMessage(['Zapdos'])).toMatch(/^Zapdos sai do catálogo./);
  });

  it('L13: nenhuma carta excluída quando todas estão em coleções', () => {
    expect(
      bulkDeletedNotice({ deleted: [], skipped: [{ id: '1', name: 'Zico', number: '8' }] }),
    ).toEqual({
      title: 'Nenhuma carta excluída',
      detail: 'Zico nº 008 ficou porque está em coleções.',
    });
  });
});
