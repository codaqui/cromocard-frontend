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

function useSignInOut(storeAccessToken: (token: string) => void, clearSession: () => void) {
  const [hasSignedOut, setHasSignedOut] = useState(false);

  const signIn = useCallback(
    (token: string) => {
      setHasSignedOut(false);
      storeAccessToken(token);
    },
    [storeAccessToken],
  );

  const signOut = useCallback(() => {
    void authApi.logout().catch(() => undefined);
    setHasSignedOut(true);
    clearSession();
  }, [clearSession]);

  return { hasSignedOut, signIn, signOut };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, storeAccessToken] = useAccessToken();
  const { isRestoringSession, clearSession } = useSessionRestore(storeAccessToken);
  const { hasSignedOut, signIn, signOut } = useSignInOut(storeAccessToken, clearSession);

  const value = useMemo(
    () => ({
      user: accessToken ? decodeAccessToken(accessToken) : null,
      isRestoringSession,
      hasSignedOut,
      signIn,
      signOut,
    }),
    [accessToken, isRestoringSession, hasSignedOut, signIn, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
