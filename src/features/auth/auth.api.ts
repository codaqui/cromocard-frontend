import { api } from '@/lib/http';

import type { ForgotPasswordInput, LoginInput, ResendVerificationInput } from './auth.schemas';
import type { AuthSession, GoogleLoginInput, RegisteredUser, RegisterRequest } from './auth.types';

export const authApi = {
  login: (input: LoginInput) => api.post<AuthSession>('/auth/login', input),
  loginWithGoogle: (input: GoogleLoginInput) => api.post<AuthSession>('/auth/google', input),
  refresh: () => api.post<AuthSession>('/auth/refresh'),
  logout: () => api.post<void>('/auth/logout'),
  register: (input: RegisterRequest) => api.post<RegisteredUser>('/auth/register', input),
  verifyEmail: (token: string) => api.post<void>('/auth/verify-email', { token }),
  resendVerification: (input: ResendVerificationInput) =>
    api.post<void>('/auth/verify-email/resend', input),
  forgotPassword: (input: ForgotPasswordInput) => api.post<void>('/auth/password/forgot', input),
  resetPassword: (input: { token: string; password: string }) =>
    api.post<void>('/auth/password/reset', input),
};
