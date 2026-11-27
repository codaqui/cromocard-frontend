import { describe, expect, it } from 'vitest';

import { createListingSchema, emptyListingForm, INVALID_PRICE_MESSAGE } from './listings.schemas';

const CARD_ID = '0190a000-0000-7000-8000-000000000001';
const MINT_ID = '0190a000-0000-7025-8855-82876fd0f8bf';

const validForm = () => ({
  ...emptyListingForm(CARD_ID),
  conditionId: MINT_ID,
  price: '1.850,00',
  description: '  Carta perfeita sem marcas  ',
});

function errorsOf(values: object) {
  const result = createListingSchema.safeParse(values);
  return result.success ? {} : result.error.flatten().fieldErrors;
}

describe('createListingSchema', () => {
  it('CA1: converte o formulário no corpo da API', () => {
    expect(createListingSchema.parse(validForm())).toEqual({
      cardId: CARD_ID,
      conditionId: MINT_ID,
      price: '1850.00',
      availableQuantity: 1,
      description: 'Carta perfeita sem marcas',
      photoUrls: [],
    });
  });

  it('CA4: recusa preço 0 e -10 com a mensagem do caso de uso', () => {
    expect(errorsOf({ ...validForm(), price: '0' }).price).toEqual([INVALID_PRICE_MESSAGE]);
    expect(errorsOf({ ...validForm(), price: '-10' }).price).toEqual([INVALID_PRICE_MESSAGE]);
  });

  it('CA13: exige a condição e a quantidade de 1 a 99', () => {
    const message = 'Informe uma quantidade de 1 a 99';

    expect(errorsOf({ ...validForm(), conditionId: '' }).conditionId).toEqual([
      'Escolha a condição da carta',
    ]);
    expect(errorsOf({ ...validForm(), availableQuantity: '0' }).availableQuantity).toEqual([
      message,
    ]);
    expect(errorsOf({ ...validForm(), availableQuantity: '100' }).availableQuantity).toEqual([
      message,
    ]);
    expect(errorsOf({ ...validForm(), availableQuantity: '1,5' }).availableQuantity).toEqual([
      message,
    ]);
  });

  it('R3: exige a carta, aceita descrição vazia e limita a 2000 caracteres e 4 fotos', () => {
    expect(errorsOf({ ...validForm(), cardId: '' }).cardId).toEqual([
      'Escolha a carta no catálogo',
    ]);
    expect(
      createListingSchema.parse({ ...validForm(), description: '  ' }).description,
    ).toBeUndefined();
    expect(errorsOf({ ...validForm(), description: 'a'.repeat(2001) }).description).toHaveLength(1);
    expect(
      errorsOf({ ...validForm(), photoUrls: ['a', 'b', 'c', 'd', 'e'] }).photoUrls,
    ).toHaveLength(1);
  });
});
