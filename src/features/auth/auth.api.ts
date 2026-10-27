import { api } from '@/lib/http';

import type { LoginInput } from './auth.schemas';
import type { AuthSession, GoogleLoginInput } from './auth.types';

export const authApi = {
  login: (input: LoginInput) => api.post<AuthSession>('/auth/login', input),
  loginWithGoogle: (input: GoogleLoginInput) => api.post<AuthSession>('/auth/google', input),
  refresh: () => api.post<AuthSession>('/auth/refresh'),
  logout: () => api.post<void>('/auth/logout'),
};
