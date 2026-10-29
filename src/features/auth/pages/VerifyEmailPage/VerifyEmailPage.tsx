import { useEffect, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { loginAfterEmailConfirmedPath, paths } from '@/routes/paths';

import { useVerifyEmail } from '../../auth.queries';
import { authErrorCodes } from '../../auth.types';
import { AuthStatus } from '../../components/AuthStatus/AuthStatus';
import { ResendVerificationForm } from '../../components/ResendVerificationForm/ResendVerificationForm';
import { useResendVerificationFeedback } from '../../hooks/useResendVerificationFeedback';

function InvalidLink() {
  const resend = useResendVerificationFeedback();

  return (
    <AuthStatus tone="danger" title="Link inválido ou expirado">
      <p>Este link de confirmação não vale mais. Informe seu e-mail para receber um novo.</p>
      <ResendVerificationForm defaultEmail="" {...resend} onSubmit={resend.submit} />
      <p>
        <Link to={paths.login}>Voltar para o login</Link>
      </p>
    </AuthStatus>
  );
}

function useVerifyOnce(token: string) {
  const verify = useVerifyEmail();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  return verify;
}

function VerifyToken({ token }: { token: string }) {
  const verify = useVerifyOnce(token);

  if (verify.isSuccess) return <Navigate to={loginAfterEmailConfirmedPath} replace />;
  if (verify.error?.code === authErrorCodes.invalidVerificationToken) return <InvalidLink />;
  if (verify.error) return <ErrorState message={verify.error.message} />;

  return <LoadingState message="Confirmando seu e-mail…" />;
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  return token ? <VerifyToken token={token} /> : <InvalidLink />;
}
