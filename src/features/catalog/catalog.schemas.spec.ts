import { describe, expect, it } from 'vitest';

import { albumFormSchema, cardFormSchema, categoryFormSchema } from './catalog.schemas';

const ALBUM_ID = '0190f3a4-7b1c-7d2e-8f3a-4b5c6d7e8f90';
const FRONT_IMAGE_URL = 'https://hml-api.cromocard.com.br/uploads/cards/frente.webp';

const emptyAlbum = {
  title: ' Copa 2026 ',
  publisher: '',
  year: '',
  description: '',
  coverUrl: '',
  categoryId: '',
};

const validCard = {
  name: 'Pelé',
  number: '10',
  description: '',
  frontImageUrl: FRONT_IMAGE_URL,
  backImageUrl: '',
  albumId: ALBUM_ID,
  categoryId: '',
  rarityId: '',
  languageId: '',
};

function messagesOf(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? [];
}

describe('albumFormSchema', () => {
  it('R5: só o título é obrigatório e os campos vazios viram null', () => {
    expect(albumFormSchema.parse(emptyAlbum)).toEqual({
      title: 'Copa 2026',
      publisher: null,
      year: null,
      description: null,
      coverUrl: null,
      categoryId: null,
    });
  });

  it('R5: converte o ano para número', () => {
    expect(albumFormSchema.parse({ ...emptyAlbum, year: '2026' }).year).toBe(2026);
  });

  it('R8: recusa título vazio e ano que não é número, com a mensagem de cada campo', () => {
    const result = albumFormSchema.safeParse({ ...emptyAlbum, title: ' ', year: 'abc' });

    expect(messagesOf(result)).toEqual(['Informe o título do álbum', 'Informe o ano com números']);
  });
});

describe('cardFormSchema', () => {
  it('R6: aceita a carta com nome, número, álbum e frente, com os opcionais vazios em null', () => {
    expect(cardFormSchema.parse(validCard)).toMatchObject({
      name: 'Pelé',
      number: '10',
      albumId: ALBUM_ID,
      backImageUrl: null,
      rarityId: null,
    });
  });

  it('R6: exige a imagem da frente', () => {
    const result = cardFormSchema.safeParse({ ...validCard, frontImageUrl: '' });

    expect(messagesOf(result)).toEqual(['Envie a imagem']);
  });

  it('R8: recusa número acima de 20 caracteres', () => {
    const result = cardFormSchema.safeParse({ ...validCard, number: '1'.repeat(21) });

    expect(messagesOf(result)).toEqual(['Use no máximo 20 caracteres']);
  });
});

describe('categoryFormSchema', () => {
  it('R15: aceita categoria sem pai', () => {
    expect(
      categoryFormSchema.parse({ name: 'Futebol', type: 'ALBUM', parentCategoryId: '' }),
    ).toEqual({ name: 'Futebol', type: 'ALBUM', parentCategoryId: null });
  });

  it('R15: exige o tipo da categoria', () => {
    const result = categoryFormSchema.safeParse({
      name: 'Futebol',
      type: '',
      parentCategoryId: '',
    });

    expect(messagesOf(result)).toEqual(['Escolha o tipo da categoria']);
  });
});
