import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { settingsApi } from './settings.api';
import {
  CATEGORY_OPTIONS_PAGE_SIZE,
  settingsKeys,
  useCategoryOptions,
  useDefaultCategories,
  useGlobalSettings,
  useUpdateBanner,
  useUpdateDefaultCategories,
  useUpdateGoals,
  useUpdateTemplates,
  useUploadSettingImage,
} from './settings.queries';
import { SETTING_KEYS } from './settings.types';

vi.mock('./settings.api', () => ({
  settingsApi: {
    list: vi.fn(),
    updateBanner: vi.fn(),
    updateTemplates: vi.fn(),
    updateGoals: vi.fn(),
    listDefaultCategories: vi.fn(),
    updateDefaultCategories: vi.fn(),
    listCategoryOptions: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

const POKEMON = { id: 'c-1', name: 'Pokémon', type: 'CARD' as const, backImageUrl: null };

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  vi.mocked(settingsApi.list).mockResolvedValue([
    {
      key: SETTING_KEYS.votingGoal,
      value: 200,
      description: null,
      updatedAt: '2026-11-16T12:00:00Z',
      updatedBy: null,
    },
    {
      key: SETTING_KEYS.monthlySignupGoal,
      value: 4000,
      description: null,
      updatedAt: '2026-11-16T12:00:00Z',
      updatedBy: null,
    },
  ]);
});

describe('settingsKeys', () => {
  it('as chaves ficam sob admin/settings', () => {
    expect(settingsKeys.list()).toEqual(['admin', 'settings', 'list']);
    expect(settingsKeys.categoryOptions({ q: 'poke' })).toEqual([
      'admin',
      'settings',
      'category-options',
      { q: 'poke' },
    ]);
  });
});

describe('useGlobalSettings', () => {
  it('R3: entrega as configurações já lidas por módulo', async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useGlobalSettings(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.goals).toEqual({ monthlySignupGoal: 4000, votingGoal: 200 });
  });
});

describe('useUpdateBanner', () => {
  it('CA2: depois de salvar, recarrega as configurações', async () => {
    vi.mocked(settingsApi.updateBanner).mockResolvedValue({} as never);
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ settings: useGlobalSettings(), save: useUpdateBanner() }),
      {
        wrapper,
      },
    );
    await waitFor(() => expect(result.current.settings.isSuccess).toBe(true));
    const callsBefore = vi.mocked(settingsApi.list).mock.calls.length;

    await act(() => result.current.save.mutateAsync({} as never));

    await waitFor(() =>
      expect(vi.mocked(settingsApi.list).mock.calls.length).toBe(callsBefore + 1),
    );
  });
});

describe('templates e metas', () => {
  it('CA7: salva a lista de templates pela API', async () => {
    vi.mocked(settingsApi.updateTemplates).mockResolvedValue({} as never);
    const templates = [{ name: 'Aviso', title: 'Título {dia}', content: 'Texto' }];
    const { wrapper } = setup();
    const { result } = renderHook(() => useUpdateTemplates(), { wrapper });

    await act(() => result.current.mutateAsync(templates));

    expect(vi.mocked(settingsApi.updateTemplates).mock.calls[0]?.[0]).toEqual(templates);
  });

  it('CA9: salva as duas metas pela API', async () => {
    const goals = { monthlySignupGoal: null, votingGoal: 150 };
    vi.mocked(settingsApi.updateGoals).mockResolvedValue(goals);
    const { wrapper } = setup();
    const { result } = renderHook(() => useUpdateGoals(), { wrapper });

    await expect(act(() => result.current.mutateAsync(goals))).resolves.toEqual(goals);
  });
});

describe('categorias padrão', () => {
  it('CA10: o que a API devolveu ao salvar vira a lista atual, sem buscar de novo', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue([]);
    vi.mocked(settingsApi.updateDefaultCategories).mockResolvedValue([POKEMON]);
    const { wrapper, queryClient } = setup();
    const { result } = renderHook(() => useUpdateDefaultCategories(), { wrapper });

    await act(() => result.current.mutateAsync([{ id: POKEMON.id, backImageUrl: null }]));

    expect(queryClient.getQueryData(settingsKeys.defaultCategories())).toEqual([POKEMON]);
  });

  it('R10: busca as categorias padrão', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue([POKEMON]);
    const { wrapper } = setup();
    const { result } = renderHook(() => useDefaultCategories(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([POKEMON]));
  });

  it('L9: busca as franquias de 100 em 100 e para na última página', async () => {
    const page = (n: number) => ({
      data: [],
      meta: { page: n, pageSize: CATEGORY_OPTIONS_PAGE_SIZE, total: 150, totalPages: 2 },
    });
    vi.mocked(settingsApi.listCategoryOptions)
      .mockResolvedValueOnce(page(1))
      .mockResolvedValueOnce(page(2));
    const { wrapper } = setup();
    const { result } = renderHook(() => useCategoryOptions('poke'), { wrapper });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(() => result.current.fetchNextPage());

    expect(settingsApi.listCategoryOptions).toHaveBeenLastCalledWith({
      q: 'poke',
      page: 2,
      pageSize: CATEGORY_OPTIONS_PAGE_SIZE,
    });
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });

  it('CA4: categoria que sumiu (404) faz a lista de categorias padrão recarregar', async () => {
    vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue([POKEMON]);
    vi.mocked(settingsApi.updateDefaultCategories).mockRejectedValue(
      new ApiError({
        status: 404,
        code: 'CATEGORY_NOT_FOUND',
        message: 'Categoria não encontrada',
      }),
    );
    const { wrapper } = setup();
    const { result } = renderHook(
      () => ({ list: useDefaultCategories(), save: useUpdateDefaultCategories() }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    const loads = vi.mocked(settingsApi.listDefaultCategories).mock.calls.length;

    await act(() => result.current.save.mutateAsync([]).catch(() => undefined));

    await waitFor(() =>
      expect(vi.mocked(settingsApi.listDefaultCategories).mock.calls.length).toBe(loads + 1),
    );
  });
});

describe('useUploadSettingImage', () => {
  it('R12: sobe a imagem na pasta do módulo', async () => {
    vi.mocked(settingsApi.uploadImage).mockResolvedValue({ key: 'k', url: 'https://u/v.png' });
    const file = new File(['x'], 'verso.png', { type: 'image/png' });
    const { wrapper } = setup();
    const { result } = renderHook(() => useUploadSettingImage('cards'), { wrapper });

    const stored = await act(() => result.current.mutateAsync(file));

    expect(settingsApi.uploadImage).toHaveBeenCalledWith('cards', file);
    expect(stored.url).toBe('https://u/v.png');
  });
});
