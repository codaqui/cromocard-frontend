import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from '@/contexts/AuthContext';
import { accessTokenStore } from '@/lib/access-token';
import { onUnauthorized } from '@/lib/http';
import { decodeAccessToken } from '@/lib/jwt';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState(accessTokenStore.get);

  const signOut = useCallback(() => {
    accessTokenStore.set(null);
    setAccessToken(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => onUnauthorized(signOut), [signOut]);

  const value = useMemo(
    () => ({ user: accessToken ? decodeAccessToken(accessToken) : null, signOut }),
    [accessToken, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
