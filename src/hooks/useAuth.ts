import { use } from 'react';

import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro do <AuthProvider>');
  }

  return context;
}
