import { describe, expect, it } from 'vitest';

import { catalogItemTexts, formModalTextsOf } from './catalog.labels';
import type { CatalogItemKind } from './catalog.types';

const kinds: CatalogItemKind[] = ['card', 'album', 'category'];

describe('catalog.labels', () => {
  it.each(kinds)('R9: os avisos de %s citam o nome do item', (kind) => {
    const texts = catalogItemTexts[kind];

    expect(texts.created('Copa').detail).toContain('Copa');
    expect(texts.updated('Copa').detail).toBe('Copa: Alterações registradas no log de auditoria.');
    expect(texts.deleted('Copa').detail).toBe('Copa saiu das buscas.');
    expect(texts.blockedMessage('Copa')).toMatch(/^Copa /);
  });

  it('R4: o cadastro de carta usa o título, o botão e a contagem de erros do Figma', () => {
    const texts = formModalTextsOf('card');

    expect(texts).toMatchObject({
      title: 'Cadastrar nova carta',
      subtitle: 'Preencha os dados e envie as imagens da carta.',
      submitLabel: 'Cadastrar Carta no Catálogo',
      note: undefined,
    });
    expect(texts.invalidNote(1)).toBe('Corrija o campo destacado para cadastrar a carta.');
    expect(texts.invalidNote(5)).toBe('Corrija os 5 campos destacados para cadastrar a carta.');
  });

  it('R14: a edição avisa a auditoria e pede para salvar as alterações', () => {
    const texts = formModalTextsOf('album', 'Copa 2026');

    expect(texts).toMatchObject({
      title: 'Editar álbum',
      subtitle: 'Altere os dados de Copa 2026.',
      submitLabel: 'Salvar alterações',
      note: 'Alterações registradas no log de auditoria.',
    });
    expect(texts.invalidNote(2)).toBe('Corrija os 2 campos destacados para salvar as alterações.');
  });
});
