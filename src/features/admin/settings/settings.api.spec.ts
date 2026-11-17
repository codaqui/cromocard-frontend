import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { settingsApi } from './settings.api';

vi.mock('@/lib/http', () => ({
  api: { get: vi.fn(), getPage: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

function callsOf(method: keyof typeof api) {
  return vi.mocked(api)[method].mock.calls;
}

const BANNER = {
  enabled: true,
  title: 'Semana',
  subtitle: '',
  ctaText: 'Ver',
  ctaUrl: 'https://cromocard.com.br',
  imageUrl: null,
};

describe('settingsApi', () => {
  it('R3: lista as configurações', () => {
    void settingsApi.list();
    expect(callsOf('get')).toContainEqual(['/admin/settings']);
  });

  it('R9: salva o banner pela chave, com o valor inteiro', () => {
    void settingsApi.updateBanner(BANNER);
    expect(callsOf('patch')).toContainEqual(['/admin/settings/home.banner', { value: BANNER }]);
  });

  it('R11: salva a lista inteira de templates', () => {
    const templates = [{ name: 'Aviso', title: 'Título', content: 'Texto' }];
    void settingsApi.updateTemplates(templates);
    expect(callsOf('patch')).toContainEqual([
      '/admin/settings/notification.templates',
      { value: templates },
    ]);
  });

  it('R16: salva as duas metas juntas', () => {
    void settingsApi.updateGoals({ monthlySignupGoal: null, votingGoal: 200 });
    expect(callsOf('patch')).toContainEqual([
      '/admin/settings/goals',
      { monthlySignupGoal: null, votingGoal: 200 },
    ]);
  });

  it('R10: lista e salva as categorias padrão com os versos', () => {
    const categories = [{ id: 'c-1', backImageUrl: null, isPinned: false }];
    void settingsApi.listDefaultCategories();
    void settingsApi.updateDefaultCategories(categories);
    expect(callsOf('get')).toContainEqual(['/admin/settings/default-categories']);
    expect(callsOf('patch')).toContainEqual(['/admin/settings/default-categories', { categories }]);
  });

  it('L9: busca as categorias do catálogo para adicionar uma padrão', () => {
    void settingsApi.listCategoryOptions({ q: 'poke', pageSize: 20 });
    expect(callsOf('getPage')).toContainEqual([
      '/admin/catalog/categories',
      { q: 'poke', pageSize: 20 },
    ]);
  });

  it('R12: sobe a imagem na pasta pedida', () => {
    const file = new File(['x'], 'verso.png', { type: 'image/png' });
    void settingsApi.uploadImage('cards', file);
    const [url, form] = callsOf('post')[0] as [string, FormData];
    expect(url).toBe('/uploads');
    expect(form.get('folder')).toBe('cards');
    expect(form.get('file')).toBe(file);
  });
});
