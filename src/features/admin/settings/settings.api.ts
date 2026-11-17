import { api } from '@/lib/http';

import type { BannerInput } from './settings.schemas';
import {
  type CategoryOption,
  type DefaultCategory,
  type DefaultCategoryInput,
  type Goals,
  type ListCategoryOptionsParams,
  type NotificationTemplate,
  SETTING_KEYS,
  type SettingView,
  type StoredImage,
  type UploadFolder,
} from './settings.types';

const BASE_PATH = '/admin/settings';
const DEFAULT_CATEGORIES_PATH = `${BASE_PATH}/default-categories`;

function imageForm(folder: UploadFolder, file: File): FormData {
  const form = new FormData();
  form.append('folder', folder);
  form.append('file', file);
  return form;
}

export const settingsApi = {
  list: () => api.get<SettingView[]>(BASE_PATH),
  updateBanner: (value: BannerInput) =>
    api.patch<SettingView>(`${BASE_PATH}/${SETTING_KEYS.homeBanner}`, { value }),
  updateTemplates: (value: NotificationTemplate[]) =>
    api.patch<SettingView>(`${BASE_PATH}/${SETTING_KEYS.notificationTemplates}`, { value }),
  updateGoals: (goals: Goals) => api.patch<Goals>(`${BASE_PATH}/goals`, goals),
  listDefaultCategories: () => api.get<DefaultCategory[]>(DEFAULT_CATEGORIES_PATH),
  updateDefaultCategories: (categories: DefaultCategoryInput[]) =>
    api.patch<DefaultCategory[]>(DEFAULT_CATEGORIES_PATH, { categories }),
  listCategoryOptions: (params: ListCategoryOptionsParams) =>
    api.getPage<CategoryOption>('/admin/catalog/categories', params),
  uploadImage: (folder: UploadFolder, file: File) =>
    api.post<StoredImage>('/uploads', imageForm(folder, file)),
};
