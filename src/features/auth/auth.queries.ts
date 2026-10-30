import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';

import { authApi } from './auth.api';

export function useLogin() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken }) => signIn(accessToken),
  });
}

export function useGoogleLogin() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: authApi.loginWithGoogle,
    onSuccess: ({ accessToken }) => signIn(accessToken),
  });
}
