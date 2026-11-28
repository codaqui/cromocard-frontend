import { describe, expect, it } from 'vitest';

import { typeLabelOf } from './notifications.labels';

describe('typeLabelOf', () => {
  it.each([
    { type: 'GLOBAL', label: 'Aviso da plataforma', action: 'Ver' },
    { type: 'NEW_MESSAGE', label: 'Nova mensagem', action: 'Responder' },
    { type: 'CATALOG_REQUEST', label: 'Solicitação ao catálogo', action: 'Ver no Catálogo' },
    { type: 'SELLER_REVIEW', label: 'Cadastro de vendedor', action: 'Ver cadastro' },
    { type: 'USER_WARNED', label: 'Advertência', action: 'Ver' },
  ])('$type vira "$label"', ({ type, label, action }) => {
    expect(typeLabelOf(type)).toEqual({ label, action });
  });

  it('tipo novo que o site ainda não conhece aparece como "Aviso"', () => {
    expect(typeLabelOf('ORDER_SHIPPED')).toEqual({ label: 'Aviso', action: 'Ver' });
  });
});
