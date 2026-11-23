import { describe, expect, it } from 'vitest';

import {
  albumFormSchema,
  bulkDeleteFormSchema,
  cardFormSchema,
  categoryFormSchema,
  variantLabelsOf,
} from './catalog.schemas';

const ALBUM_ID = '0190f3a4-7b1c-7d2e-8f3a-4b5c6d7e8f90';
const CATEGORY_ID = '0190f3a4-7b1c-7d2e-8f3a-4b5c6d7e8f91';
const RARITY_ID = '0190f3a4-7b1c-7d2e-8f3a-4b5c6d7e8f92';
const LANGUAGE_ID = '0190f3a4-7b1c-7d2e-8f3a-4b5c6d7e8f93';
const FRONT_IMAGE_URL = 'https://hml-api.cromocard.com.br/uploads/cards/frente.webp';

const emptyAlbum = {
  title: ' Copa 2026 ',
  publisher: '',
  year: '',
  description: '',
  coverUrl: '',
  categoryId: '',
  status: 'ACTIVE',
};

const validCard = {
  name: 'Pelé',
  number: '10',
  code: '',
  variants: '',
  description: '',
  frontImageUrl: FRONT_IMAGE_URL,
  backImageUrl: '',
  albumId: ALBUM_ID,
  categoryId: CATEGORY_ID,
  rarityId: RARITY_ID,
  languageId: LANGUAGE_ID,
};

const emptyCategory = {
  name: 'Futebol',
  parentCategoryId: '',
  description: '',
  badge: '',
};

function messagesOf(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? [];
}

function fieldsOf(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return result.error?.issues.map((issue) => issue.path.join('.')) ?? [];
}

describe('albumFormSchema', () => {
  it('R5: só o título e o status são obrigatórios, e os campos vazios viram null', () => {
    expect(albumFormSchema.parse(emptyAlbum)).toEqual({
      title: 'Copa 2026',
      publisher: null,
      year: null,
      description: null,
      coverUrl: null,
      categoryId: null,
      status: 'ACTIVE',
    });
  });

  it('R5: aceita o álbum inativo e recusa outro status', () => {
    expect(albumFormSchema.parse({ ...emptyAlbum, status: 'INACTIVE' }).status).toBe('INACTIVE');
    expect(messagesOf(albumFormSchema.safeParse({ ...emptyAlbum, status: '' }))).toEqual([
      'Escolha o status do álbum.',
    ]);
  });

  it('R5: converte o ano para número', () => {
    expect(albumFormSchema.parse({ ...emptyAlbum, year: '2026' }).year).toBe(2026);
  });

  it('R8: recusa título vazio e ano que não é número, com a mensagem de cada campo', () => {
    const result = albumFormSchema.safeParse({ ...emptyAlbum, title: ' ', year: 'abc' });

    expect(messagesOf(result)).toEqual([
      'Informe o título do álbum.',
      'Informe o ano com números.',
    ]);
  });
});

describe('cardFormSchema', () => {
  it('CA8: sem álbum e sem numeração, a carta com nome, franquia, raridade, idioma e frente é aceita', () => {
    expect(cardFormSchema.parse({ ...validCard, albumId: '', number: '' })).toMatchObject({
      name: 'Pelé',
      number: null,
      albumId: null,
      backImageUrl: null,
      categoryId: CATEGORY_ID,
      rarityId: RARITY_ID,
      languageId: LANGUAGE_ID,
    });
  });

  it('CA8: recusa a carta sem raridade, no campo rarityId', () => {
    const result = cardFormSchema.safeParse({ ...validCard, rarityId: '' });

    expect(fieldsOf(result)).toEqual(['rarityId']);
    expect(messagesOf(result)).toEqual(['Selecione a raridade.']);
  });

  it('R6: exige a franquia e o idioma, cada um com a sua mensagem', () => {
    const result = cardFormSchema.safeParse({ ...validCard, categoryId: '', languageId: '' });

    expect(messagesOf(result)).toEqual(['Selecione a franquia.', 'Selecione o idioma.']);
  });

  it('R6: recusa referência que não é uma opção da lista', () => {
    const result = cardFormSchema.safeParse({ ...validCard, rarityId: 'rara' });

    expect(messagesOf(result)).toEqual(['Selecione uma opção da lista.']);
  });

  it('R6: exige a imagem da frente', () => {
    const result = cardFormSchema.safeParse({ ...validCard, frontImageUrl: '' });

    expect(messagesOf(result)).toEqual(['Envie a imagem.']);
  });

  it('R8: recusa número acima de 20 caracteres', () => {
    const result = cardFormSchema.safeParse({ ...validCard, number: '1'.repeat(21) });

    expect(messagesOf(result)).toEqual(['Use no máximo 20 caracteres.']);
  });
});

describe('código e variantes da carta (CCD105)', () => {
  it('R8: código vazio vira null e o preenchido perde os espaços das pontas', () => {
    expect(cardFormSchema.parse({ ...validCard, code: '' }).code).toBeNull();
    expect(cardFormSchema.parse({ ...validCard, code: ' CRD-POK-0004 ' }).code).toBe(
      'CRD-POK-0004',
    );
  });

  it('R8: recusa código acima de 30 caracteres', () => {
    const result = cardFormSchema.safeParse({ ...validCard, code: 'C'.repeat(31) });

    expect(fieldsOf(result)).toEqual(['code']);
    expect(messagesOf(result)).toEqual(['Use no máximo 30 caracteres.']);
  });

  it('R8: arruma as variantes como o backend: sem vazias nem repetidas', () => {
    const parsed = cardFormSchema.parse({
      ...validCard,
      variants: ' Shadowless ,, Holofoil, shadowless ',
    });

    expect(parsed.variants).toBe('Shadowless, Holofoil');
    expect(cardFormSchema.parse({ ...validCard, variants: ' , ' }).variants).toBeNull();
  });

  it('R8: recusa variantes acima de 120 caracteres', () => {
    const variants = Array.from({ length: 13 }, (_, index) => `Variante${index}`).join(',');

    expect(messagesOf(cardFormSchema.safeParse({ ...validCard, variants }))).toEqual([
      'Use no máximo 120 caracteres.',
    ]);
  });

  it('R8: separa as variantes guardadas em etiquetas', () => {
    expect(variantLabelsOf('Shadowless, Holofoil')).toEqual(['Shadowless', 'Holofoil']);
    expect(variantLabelsOf(null)).toEqual([]);
  });
});

describe('bulkDeleteFormSchema', () => {
  it('R10: exige o motivo da exclusão em lote', () => {
    const result = bulkDeleteFormSchema.safeParse({ reason: ' ' });

    expect(messagesOf(result)).toEqual(['O motivo precisa ter pelo menos 3 caracteres']);
    expect(bulkDeleteFormSchema.parse({ reason: ' Duplicadas ' })).toEqual({
      reason: 'Duplicadas',
    });
  });
});

describe('categoryFormSchema', () => {
  it('R15: aceita categoria sem pai e sem descrição', () => {
    expect(categoryFormSchema.parse(emptyCategory)).toEqual({
      name: 'Futebol',
      parentCategoryId: null,
      description: null,
      badge: null,
    });
  });

  it('CA14: o selo vazio vira nulo e Padrão e Em alta passam', () => {
    const parse = (badge: string) => categoryFormSchema.parse({ ...emptyCategory, badge }).badge;

    expect([parse(''), parse('STANDARD'), parse('TRENDING')]).toEqual([
      null,
      'STANDARD',
      'TRENDING',
    ]);
  });

  it('CA14: recusa um selo que não é da lista', () => {
    const result = categoryFormSchema.safeParse({ ...emptyCategory, badge: 'GOLD' });

    expect(messagesOf(result)).toEqual(['Escolha o selo da lista.']);
  });

  it('R15: guarda a descrição sem os espaços das pontas e recusa acima de 255 caracteres', () => {
    expect(categoryFormSchema.parse({ ...emptyCategory, description: ' Copas ' }).description).toBe(
      'Copas',
    );
    expect(
      messagesOf(categoryFormSchema.safeParse({ ...emptyCategory, description: 'a'.repeat(256) })),
    ).toEqual(['Use no máximo 255 caracteres.']);
  });

  it('L11: a categoria não tem mais tipo, e o campo enviado é descartado', () => {
    expect(categoryFormSchema.parse({ ...emptyCategory, type: 'ALBUM' })).not.toHaveProperty(
      'type',
    );
  });
});
