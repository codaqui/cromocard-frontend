import { api } from '@/lib/http';

import type { UpdateUserInput } from './users.schemas';
import type { ListUsersParams, UserSummary } from './users.types';

export const usersApi = {
  list: (params: ListUsersParams) => api.getPage<UserSummary>('/users', params),
  getMe: () => api.get<UserSummary>('/users/me'),
  updateMe: (input: UpdateUserInput) => api.patch<UserSummary>('/users/me', input),
  deleteMe: () => api.delete('/users/me'),
};
