import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext } from '@/contexts/AuthContext';
import { authApi } from '@/features/auth';
import { accessTokenStore } from '@/lib/access-token';
import { onUnauthorized, refreshSessionOnce, setSessionRefresher } from '@/lib/http';
import { decodeAccessToken } from '@/lib/jwt';

interface AuthProviderProps {
  children: ReactNode;
}

function useAccessToken() {
  const [accessToken, setAccessToken] = useState(accessTokenStore.get);

  const storeAccessToken = useCallback((token: string | null) => {
    accessTokenStore.set(token);
    setAccessToken(token);
  }, []);

  return [accessToken, storeAccessToken] as const;
}

function useSessionRestore(storeAccessToken: (token: string | null) => void) {
  const queryClient = useQueryClient();
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const clearSession = useCallback(() => {
    storeAccessToken(null);
    queryClient.clear();
  }, [queryClient, storeAccessToken]);

  const refresh = useCallback(async () => {
    const session = await authApi.refresh().catch(() => null);
    storeAccessToken(session?.accessToken ?? null);
    return Boolean(session);
  }, [storeAccessToken]);

  useEffect(() => setSessionRefresher(refresh), [refresh]);
  useEffect(() => onUnauthorized(clearSession), [clearSession]);
  useEffect(() => {
    void refreshSessionOnce().finally(() => setIsRestoringSession(false));
  }, []);

  return { isRestoringSession, clearSession };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, storeAccessToken] = useAccessToken();
  const { isRestoringSession, clearSession } = useSessionRestore(storeAccessToken);

  const signOut = useCallback(() => {
    void authApi.logout().catch(() => undefined);
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user: accessToken ? decodeAccessToken(accessToken) : null,
      isRestoringSession,
      signIn: storeAccessToken,
      signOut,
    }),
    [accessToken, isRestoringSession, storeAccessToken, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
