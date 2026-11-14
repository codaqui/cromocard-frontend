import { useState } from 'react';

import { env } from '@/config/env';

import { useGoogleLogin, useLogin } from '../../auth.queries';
import { authErrorCodes } from '../../auth.types';
import type { LoginInput } from '../../auth.schemas';
import type { AuthSession } from '../../auth.types';
import { useLoginRedirect } from '../../hooks/useLoginRedirect';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { LoginForm } from '../LoginForm/LoginForm';
import { LoginNotice } from './LoginNotice';

function useLoginActions() {
  const loginMutation = useLogin();
  const googleLogin = useGoogleLogin();
  const redirectAfterLogin = useLoginRedirect();
  const onSuccess = ({ user }: AuthSession) => redirectAfterLogin(user);

  return {
    isPending: loginMutation.isPending || googleLogin.isPending,
    loginIdentifier: loginMutation.variables?.login ?? '',
    error: loginMutation.error ?? googleLogin.error,
    submit: (input: LoginInput) => loginMutation.mutate(input, { onSuccess }),
    submitGoogle: (idToken: string, rememberMe: boolean) =>
      googleLogin.mutate({ idToken, rememberMe }, { onSuccess }),
  };
}

export function LoginPanel() {
  const { isPending, error, loginIdentifier, submit, submitGoogle } = useLoginActions();
  const formError = error?.code === authErrorCodes.emailNotVerified ? null : error;
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <>
      <LoginNotice error={error} loginIdentifier={loginIdentifier} />
      <LoginForm
        isSubmitting={isPending}
        apiError={formError}
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
