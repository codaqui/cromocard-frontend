import { useState } from 'react';

import { env } from '@/config/env';

import { useGoogleLogin, useLogin } from '../../auth.queries';
import type { LoginInput } from '../../auth.schemas';
import type { AuthSession } from '../../auth.types';
import { useLoginRedirect } from '../../hooks/useLoginRedirect';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { LoginForm } from '../LoginForm/LoginForm';

function useLoginActions() {
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const redirectAfterLogin = useLoginRedirect();
  const onSuccess = ({ user }: AuthSession) => redirectAfterLogin(user);

  return {
    isPending: login.isPending || googleLogin.isPending,
    error: login.error ?? googleLogin.error,
    submit: (input: LoginInput) => login.mutate(input, { onSuccess }),
    submitGoogle: (idToken: string, rememberMe: boolean) =>
      googleLogin.mutate({ idToken, rememberMe }, { onSuccess }),
  };
}

export function LoginPanel() {
  const { isPending, error, submit, submitGoogle } = useLoginActions();
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <>
      <LoginForm
        isSubmitting={isPending}
        apiError={error}
        onSubmit={submit}
        onRememberMeChange={setRememberMe}
      />
      {env.GOOGLE_CLIENT_ID && (
        <GoogleButton
          clientId={env.GOOGLE_CLIENT_ID}
          disabled={isPending}
          onCredential={(idToken) => submitGoogle(idToken, rememberMe)}
        />
      )}
    </>
  );
}
