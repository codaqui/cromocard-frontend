import { describe, expect, it } from 'vitest';

import { formatAlbumNumber, formatCount, formatEdition } from './catalog.format';

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

  it('junta editora e ano da edição', () => {
    expect(formatEdition({ publisher: 'Panini', year: 2026 })).toBe('Panini (2026)');
    expect(formatEdition({ publisher: 'Panini', year: null })).toBe('Panini');
    expect(formatEdition({ publisher: null, year: 1999 })).toBe('1999');
    expect(formatEdition({ publisher: null, year: null })).toBeNull();
  });
});
