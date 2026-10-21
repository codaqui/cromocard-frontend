import { api } from '@/lib/http';

import type {
  CategoryInput,
  CategoryView,
  HomeBanner,
  ListCategoriesParams,
  MoveDirection,
} from './settings.types';

export const settingsApi = {
  getHomeBanner: () => api.get<HomeBanner | null>('/settings/home-banner'),
  updateHomeBanner: (banner: HomeBanner) => api.put<HomeBanner>('/settings/home-banner', banner),
};

export const categoriesApi = {
  list: (params: ListCategoriesParams) => api.getPage<CategoryView>('/categories', params),
  create: (input: CategoryInput) => api.post<CategoryView>('/categories', input),
  update: (id: string, input: Partial<CategoryInput>) =>
    api.patch<CategoryView>(`/categories/${id}`, input),
  remove: (id: string) => api.delete(`/categories/${id}`),
  move: (id: string, direction: MoveDirection) =>
    api.post<CategoryView[]>(`/categories/${id}/move`, { direction }),
};
