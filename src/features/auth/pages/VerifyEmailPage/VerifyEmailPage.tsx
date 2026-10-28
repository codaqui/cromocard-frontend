import { useEffect, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { loginAfterEmailConfirmedPath, paths } from '@/routes/paths';

import { useVerifyEmail } from '../../auth.queries';
import { AuthStatus } from '../../components/AuthStatus/AuthStatus';
import { ResendVerificationForm } from '../../components/ResendVerificationForm/ResendVerificationForm';
import { useResendVerificationFeedback } from '../../hooks/useResendVerification';

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
    if (started.current) return;
    started.current = true;
    verify.mutate(token);
  }, [token, verify]);

  return verify;
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const verify = useVerifyOnce(searchParams.get('token') ?? '');

  if (verify.isSuccess) {
    return <Navigate to={loginAfterEmailConfirmedPath} replace />;
  }
  if (verify.isError) return <InvalidLink />;

  return <LoadingState message="Confirmando seu e-mail…" />;
}
