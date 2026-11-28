import { describe, expect, it } from 'vitest';

import {
  blocksContact,
  contactModerationSchema,
  evidencesSchema,
  reportsContact,
} from './contact-moderation.schemas';

const file = (type: string, size = 10) => new File([new Uint8Array(size)], 'print', { type });

const issuesOf = (values: Parameters<typeof contactModerationSchema.safeParse>[0]) => {
  const result = contactModerationSchema.safeParse(values);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
};

describe('contact-moderation.schemas', () => {
  it('R3: cada opção bloqueia, denuncia ou os dois', () => {
    expect([blocksContact('block'), reportsContact('block')]).toEqual([true, false]);
    expect([blocksContact('blockAndReport'), reportsContact('blockAndReport')]).toEqual([
      true,
      true,
    ]);
    expect([blocksContact('report'), reportsContact('report')]).toEqual([false, true]);
  });

  it('CA4: na denúncia, pede o motivo e pelo menos um print', () => {
    expect(issuesOf({ option: 'report', description: '', evidences: [] })).toEqual({
      reason: 'Escolha o motivo da denúncia.',
      evidences: 'Envie pelo menos um print da conversa.',
    });
  });

  it('Somente bloquear não pede motivo nem print e não leva dados da denúncia', () => {
    expect(
      contactModerationSchema.parse({ option: 'block', description: 'x', evidences: [] }),
    ).toEqual({ option: 'block' });
  });

  it('a denúncia completa sai com o motivo, a descrição sem espaços e os prints', () => {
    const print = file('image/png');

    expect(
      contactModerationSchema.parse({
        option: 'report',
        reason: 'Spam',
        description: '  Mandou link falso  ',
        evidences: [print],
      }),
    ).toEqual({
      option: 'report',
      reason: 'Spam',
      description: 'Mandou link falso',
      evidences: [print],
    });
  });

  it('R4: recusa a descrição acima de 500 caracteres', () => {
    expect(
      issuesOf({
        option: 'report',
        reason: 'Spam',
        description: 'a'.repeat(501),
        evidences: [file('image/png')],
      }),
    ).toHaveProperty('description');
  });

  it.each([
    ['4 prints', [file('image/png'), file('image/png'), file('image/png'), file('image/png')]],
    ['um GIF', [file('image/gif')]],
    ['um print acima de 4 MB', [file('image/png', 4 * 1024 * 1024 + 1)]],
  ])('CA15: recusa %s', (_case, files) => {
    expect(evidencesSchema.safeParse(files).success).toBe(false);
  });

  it('aceita até 3 prints PNG, JPG ou WEBP', () => {
    const prints = [file('image/png'), file('image/jpeg'), file('image/webp')];

    expect(evidencesSchema.safeParse(prints).success).toBe(true);
  });
});
