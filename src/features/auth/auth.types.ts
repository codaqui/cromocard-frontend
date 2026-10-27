import type { UserRole } from '@/types/authenticated-user';

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: SessionUser;
}

export interface GoogleLoginInput {
  idToken: string;
  rememberMe: boolean;
}
