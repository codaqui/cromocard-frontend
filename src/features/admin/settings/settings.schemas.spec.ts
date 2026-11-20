import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';

import {
  backImageSchema,
  bannerFormSchema,
  bannerImageSchema,
  goalsFormSchema,
  LINK_ERROR,
  templateFormSchema,
} from './settings.schemas';

const BANNER = {
  enabled: true,
  title: 'Semana de Cartas Raras',
  subtitle: 'Confira as cartas raras desta semana.',
  ctaText: 'Ver cartas',
  ctaUrl: 'https://cromocard.com.br/catalogo?semana=raras',
  imageUrl: null,
};

function errorsOf(schema: ZodType, value: unknown): Record<string, string> {
  const result = schema.safeParse(value);
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map(({ path, message }) => [path.join('.'), message]),
  );
}

function imageFile(type: string, bytes = 10): File {
  return new File([new Uint8Array(bytes)], 'imagem', { type });
}

describe('bannerFormSchema', () => {
  it('R9: aceita o banner do Figma e tira os espaços das pontas', () => {
    expect(bannerFormSchema.parse({ ...BANNER, title: '  Semana de Cartas Raras ' })).toEqual(
      BANNER,
    );
  });

  it('CA3: recusa o link sem https://, com a mensagem do frame 859-661', () => {
    expect(errorsOf(bannerFormSchema, { ...BANNER, ctaUrl: 'cromocard catalogo raras' })).toEqual({
      ctaUrl: LINK_ERROR,
    });
    expect(errorsOf(bannerFormSchema, { ...BANNER, ctaUrl: 'http://cromocard.com.br' })).toEqual({
      ctaUrl: LINK_ERROR,
    });
  });

  it('R7: aponta título vazio e texto do botão acima de 30 caracteres', () => {
    expect(errorsOf(bannerFormSchema, { ...BANNER, title: ' ', ctaText: 'x'.repeat(31) })).toEqual({
      title: 'Informe o título',
      ctaText: 'Use no máximo 30 caracteres',
    });
  });
});

describe('templateFormSchema', () => {
  it('R19: aceita {campo} no título e no texto', () => {
    const template = { name: 'Novo álbum', title: 'Novo álbum: {álbum}', content: 'Veja {álbum}.' };
    expect(templateFormSchema.parse(template)).toEqual(template);
  });

  it('R11: recusa título acima de 120 e texto acima de 500 caracteres', () => {
    const tooLong = { name: 'Aviso', title: 'x'.repeat(121), content: 'x'.repeat(501) };
    expect(errorsOf(templateFormSchema, tooLong)).toEqual({
      title: 'Use no máximo 120 caracteres',
      content: 'Use no máximo 500 caracteres',
    });
  });
});

describe('goalsFormSchema', () => {
  it('R16: lê as metas do Figma, "4.000" e "200"', () => {
    expect(goalsFormSchema.parse({ monthlySignupGoal: '4.000', votingGoal: '200' })).toEqual({
      monthlySignupGoal: 4000,
      votingGoal: 200,
    });
  });

  it('CA9: a meta mensal vazia vira "sem meta" e o número com ponto vira inteiro', () => {
    expect(goalsFormSchema.parse({ monthlySignupGoal: '', votingGoal: '1.200' })).toEqual({
      monthlySignupGoal: null,
      votingGoal: 1200,
    });
  });

  it('CA9: a meta de votos é obrigatória e as duas são inteiras de 1 a 1.000.000', () => {
    expect(errorsOf(goalsFormSchema, { monthlySignupGoal: '0', votingGoal: '' })).toEqual({
      monthlySignupGoal: 'Informe um número inteiro de 1 a 1.000.000',
      votingGoal: 'Informe a meta de votos',
    });
    expect(errorsOf(goalsFormSchema, { monthlySignupGoal: '10,5', votingGoal: '2000000' })).toEqual(
      {
        monthlySignupGoal: 'Informe um número inteiro de 1 a 1.000.000',
        votingGoal: 'Informe um número inteiro de 1 a 1.000.000',
      },
    );
  });
});

describe('imagens', () => {
  it('R20: o banner aceita WEBP e PNG e recusa JPG', () => {
    expect(bannerImageSchema.safeParse(imageFile('image/webp')).success).toBe(true);
    expect(bannerImageSchema.safeParse(imageFile('image/png')).success).toBe(true);
    expect(errorsOf(bannerImageSchema, imageFile('image/jpeg'))).toEqual({
      '': 'Envie uma imagem WEBP ou PNG',
    });
  });

  it('R20: recusa imagem acima de 4 MB', () => {
    expect(errorsOf(bannerImageSchema, imageFile('image/png', 4 * 1024 * 1024 + 1))).toEqual({
      '': 'A imagem pode ter no máximo 4 MB',
    });
  });

  it('R12: o verso aceita JPG, como as imagens das cartas', () => {
    expect(backImageSchema.safeParse(imageFile('image/jpeg')).success).toBe(true);
    expect(errorsOf(backImageSchema, imageFile('image/gif'))).toEqual({
      '': 'Envie uma imagem PNG, JPG ou WEBP',
    });
  });
});
