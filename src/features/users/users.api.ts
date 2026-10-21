import { api } from '@/lib/http';

import type { UpdateUserInput } from './users.schemas';
import type {
  CreateUserByAdminInput,
  ListUsersParams,
  UpdateUserByAdminInput,
  UserSummary,
} from './users.types';

export const usersApi = {
  list: (params: ListUsersParams) => api.getPage<UserSummary>('/users', params),
  getMe: () => api.get<UserSummary>('/users/me'),
  updateMe: (input: UpdateUserInput) => api.patch<UserSummary>('/users/me', input),
  deleteMe: () => api.delete('/users/me'),
  getById: (id: string) => api.get<UserSummary>(`/users/${id}`),
  create: (input: CreateUserByAdminInput) => api.post<UserSummary>('/users', input),
  update: (id: string, input: UpdateUserByAdminInput) =>
    api.patch<UserSummary>(`/users/${id}`, input),
  suspend: (id: string) => api.post<UserSummary>(`/users/${id}/suspend`),
  reactivate: (id: string) => api.post<UserSummary>(`/users/${id}/reactivate`),
  remove: (id: string) => api.delete(`/users/${id}`),
  restore: (id: string) => api.post<UserSummary>(`/users/${id}/restore`),
};
