import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';

import { authApi } from './auth.api';
import type { RegisterInput } from './auth.schemas';

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

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, role, password }: RegisterInput) =>
      authApi.register({ name, email, role, password, termsAccepted: true }),
  });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: authApi.verifyEmail });
}

export function useResendVerification() {
  return useMutation({ mutationFn: authApi.resendVerification });
}
