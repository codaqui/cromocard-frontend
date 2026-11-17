import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';

import {
  formatGoal,
  templateSummary,
  toGlobalSettings,
  withFormFields,
  withTemplate,
} from './settings.format';
import { SETTING_KEYS, type SettingView } from './settings.types';

const BANNER = {
  enabled: false,
  title: 'Semana de Cartas Raras',
  subtitle: '',
  ctaText: 'Ver cartas',
  ctaUrl: 'https://cromocard.com.br/catalogo',
  imageUrl: 'https://hml-api.cromocard.com.br/uploads/banners/semana.webp',
};

const TEMPLATE = { id: 't-1', name: 'Novo álbum', title: 'Novo álbum: {álbum}', content: 'Veja.' };

function setting(key: string, value: unknown): SettingView {
  return { key, value, description: null, updatedAt: '2026-11-16T12:00:00Z', updatedBy: null };
}

describe('toGlobalSettings', () => {
  it('R3: lê o banner, os templates e as metas pela chave', () => {
    const settings = [
      setting(SETTING_KEYS.homeBanner, BANNER),
      setting(SETTING_KEYS.notificationTemplates, [TEMPLATE]),
      setting(SETTING_KEYS.monthlySignupGoal, null),
      setting(SETTING_KEYS.votingGoal, 200),
    ];

    expect(toGlobalSettings(settings)).toEqual({
      banner: BANNER,
      templates: [TEMPLATE],
      goals: { monthlySignupGoal: null, votingGoal: 200 },
    });
  });

  it('R3: banner antigo sem imagem e templates antigos sem id continuam legíveis', () => {
    const withoutImage = {
      enabled: BANNER.enabled,
      title: BANNER.title,
      subtitle: BANNER.subtitle,
      ctaText: BANNER.ctaText,
      ctaUrl: BANNER.ctaUrl,
    };
    const withoutId = { name: TEMPLATE.name, title: TEMPLATE.title, content: TEMPLATE.content };
    const settings = [
      setting(SETTING_KEYS.homeBanner, withoutImage),
      setting(SETTING_KEYS.notificationTemplates, [withoutId]),
    ];

    expect(toGlobalSettings(settings)).toEqual({
      banner: { ...withoutImage, imageUrl: null },
      templates: [withoutId],
      goals: null,
    });
  });

  it('R3: chave ausente ou inválida não quebra a tela', () => {
    const settings = [
      setting(SETTING_KEYS.homeBanner, { title: 1 }),
      setting(SETTING_KEYS.votingGoal, null),
    ];

    expect(toGlobalSettings(settings)).toEqual({ banner: null, templates: [], goals: null });
  });
});

describe('formatGoal', () => {
  it('mostra a meta com o ponto de milhar do Figma e "sem meta" como vazio', () => {
    expect(formatGoal(4000)).toBe('4.000');
    expect(formatGoal(null)).toBe('');
  });
});

describe('templateSummary', () => {
  it('R11: junta título e texto como na lista do Figma', () => {
    expect(templateSummary(TEMPLATE)).toBe('Título: Novo álbum: {álbum} • Texto: Veja.');
  });
});

describe('withFormFields', () => {
  it('CA3: leva o campo da API para o nome do campo do formulário', () => {
    const error = new ApiError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: [
        { field: 'value.ctaUrl', message: 'link' },
        { field: 'value.1.name', message: 'nome' },
        { field: 'categories.0.backImageUrl', message: 'verso' },
        { field: 'votingGoal', message: 'meta' },
      ],
    });

    expect(withFormFields(error)?.details?.map(({ field }) => field)).toEqual([
      'ctaUrl',
      'name',
      'backImageUrl',
      'votingGoal',
    ]);
  });

  it('erro sem detalhes passa como veio', () => {
    const error = new ApiError({
      status: 404,
      code: 'SETTING_NOT_FOUND',
      message: 'Não encontrada',
    });
    expect(withFormFields(error)).toBe(error);
    expect(withFormFields(null)).toBeNull();
  });
});

describe('withTemplate', () => {
  const input = { name: 'Novo', title: 'Título', content: 'Texto' };

  it('R11: novo template entra no fim da lista', () => {
    expect(withTemplate([TEMPLATE], null, input)).toEqual([TEMPLATE, input]);
  });

  it('R11: editar troca só o template da posição e mantém o id', () => {
    expect(withTemplate([TEMPLATE], 0, input)).toEqual([{ ...input, id: TEMPLATE.id }]);
  });
});
