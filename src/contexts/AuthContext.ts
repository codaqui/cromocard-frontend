import { createContext } from 'react';

import type { AuthenticatedUser } from '@/types/authenticated-user';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
