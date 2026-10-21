import { api } from '@/lib/http';

import type { LoginInput } from './auth.schemas';
import type { AuthSession } from './auth.types';

export const authApi = {
  login: (input: LoginInput) => api.post<AuthSession>('/auth/login', input),
  refresh: () => api.post<AuthSession>('/auth/refresh'),
  logout: () => api.post<void>('/auth/logout'),
  setupPassword: (token: string, password: string) =>
    api.post<void>('/auth/password/setup', { token, password }),
};
