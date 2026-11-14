import { describe, expect, it } from 'vitest';

import { toReasonInput } from './users.schemas';

describe('toReasonInput', () => {
  it('monta o corpo com o motivo informado', () => {
    expect(toReasonInput('Pedido do titular')).toEqual({ reason: 'Pedido do titular' });
  });

  it('sem motivo, manda texto vazio para a API recusar com 400', () => {
    expect(toReasonInput(undefined)).toEqual({ reason: '' });
  });
});
