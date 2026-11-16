import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { settingsApi } from './settings.api';
import { toGlobalSettings } from './settings.format';
import type { ListCategoryOptionsParams, UploadFolder } from './settings.types';

export const settingsKeys = {
  all: ['admin', 'settings'] as const,
  list: () => [...settingsKeys.all, 'list'] as const,
  defaultCategories: () => [...settingsKeys.all, 'default-categories'] as const,
  categoryOptions: (params: ListCategoryOptionsParams) =>
    [...settingsKeys.all, 'category-options', params] as const,
};

export function useGlobalSettings() {
  return useQuery({
    queryKey: settingsKeys.list(),
    queryFn: settingsApi.list,
    select: toGlobalSettings,
  });
}

export function useDefaultCategories() {
  return useQuery({
    queryKey: settingsKeys.defaultCategories(),
    queryFn: settingsApi.listDefaultCategories,
  });
}

export function useCategoryOptions(params: ListCategoryOptionsParams, enabled: boolean) {
  return useQuery({
    queryKey: settingsKeys.categoryOptions(params),
    queryFn: () => settingsApi.listCategoryOptions(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

function useSettingMutation<TInput, TOutput>(mutationFn: (input: TInput) => Promise<TOutput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.list() }),
  });
}

export function useUpdateBanner() {
  return useSettingMutation(settingsApi.updateBanner);
}

export function useUpdateTemplates() {
  return useSettingMutation(settingsApi.updateTemplates);
}

export function useUpdateGoals() {
  return useSettingMutation(settingsApi.updateGoals);
}

export function useUpdateDefaultCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateDefaultCategories,
    onSuccess: (categories) =>
      queryClient.setQueryData(settingsKeys.defaultCategories(), categories),
  });
}

export function useUploadSettingImage(folder: UploadFolder) {
  return useMutation({ mutationFn: (file: File) => settingsApi.uploadImage(folder, file) });
}
