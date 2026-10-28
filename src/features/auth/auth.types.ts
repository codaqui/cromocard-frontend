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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'SELLER';
  termsAccepted: true;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface GoogleLoginInput {
  idToken: string;
  rememberMe: boolean;
}
