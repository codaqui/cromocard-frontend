import { api } from '@/lib/http';

import type {
  AdminUpdateUserInput,
  CreateUserInput,
  ReasonInput,
  UpdateUserInput,
} from './users.schemas';
import type { ListUsersParams, UserDetail, UserSummary } from './users.types';

export const usersApi = {
  list: (params: ListUsersParams) => api.getPage<UserSummary>('/users', params),
  getMe: () => api.get<UserSummary>('/users/me'),
  getById: (id: string) => api.get<UserDetail>(`/users/${id}`),
  updateMe: (input: UpdateUserInput) => api.patch<UserSummary>('/users/me', input),
  deleteMe: () => api.delete('/users/me'),
  create: (input: CreateUserInput) => api.post<UserSummary>('/users', input),
  update: (id: string, input: AdminUpdateUserInput) =>
    api.patch<UserSummary>(`/users/${id}`, input),
  suspend: (id: string, input: ReasonInput) => api.post<UserSummary>(`/users/${id}/suspend`, input),
  reactivate: (id: string) => api.post<UserSummary>(`/users/${id}/reactivate`),
  remove: (id: string, input: ReasonInput) => api.delete(`/users/${id}`, input),
  resendActivation: (id: string) => api.postEmpty(`/users/${id}/resend-activation`),
};
