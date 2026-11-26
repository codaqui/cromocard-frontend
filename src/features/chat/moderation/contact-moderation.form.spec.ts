import { describe, expect, it } from 'vitest';

import {
  acceptsEvidences,
  blocksContact,
  reportsContact,
  validateModeration,
} from './contact-moderation.form';

const file = (type: string, size = 10) => new File([new Uint8Array(size)], 'print', { type });

describe('contact-moderation.form', () => {
  it('R3: cada opção bloqueia, denuncia ou os dois', () => {
    expect([blocksContact('block'), reportsContact('block')]).toEqual([true, false]);
    expect([blocksContact('blockAndReport'), reportsContact('blockAndReport')]).toEqual([
      true,
      true,
    ]);
    expect([blocksContact('report'), reportsContact('report')]).toEqual([false, true]);
  });

  it('CA4: na denúncia, pede o motivo e pelo menos um print', () => {
    expect(
      validateModeration({ option: 'report', reason: null, description: '', evidences: [] }),
    ).toEqual({
      reason: 'Escolha o motivo da denúncia.',
      evidences: 'Envie pelo menos um print da conversa.',
    });
  });

  it('Somente bloquear não pede motivo nem print', () => {
    expect(
      validateModeration({ option: 'block', reason: null, description: '', evidences: [] }),
    ).toEqual({});
  });

  it.each([
    ['4 prints', [file('image/png'), file('image/png'), file('image/png'), file('image/png')]],
    ['um GIF', [file('image/gif')]],
    ['um print acima de 4 MB', [file('image/png', 4 * 1024 * 1024 + 1)]],
  ])('CA15: recusa %s', (_case, files) => {
    expect(acceptsEvidences(files)).toBe(false);
  });

  it('aceita até 3 prints PNG, JPG ou WEBP', () => {
    expect(acceptsEvidences([file('image/png'), file('image/jpeg'), file('image/webp')])).toBe(
      true,
    );
  });
});
