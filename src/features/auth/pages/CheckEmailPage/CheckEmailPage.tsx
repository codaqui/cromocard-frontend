import { Link, useSearchParams } from 'react-router';

import { paths } from '@/routes/paths';

import { AuthStatus } from '../../components/AuthStatus/AuthStatus';
import { ResendVerificationForm } from '../../components/ResendVerificationForm/ResendVerificationForm';
import { useResendVerificationFeedback } from '../../hooks/useResendVerificationFeedback';

export function CheckEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const resend = useResendVerificationFeedback();

  return (
    <AuthStatus tone="info" title="Confirme seu e-mail">
      <p>
        {email ? (
          <>
            Enviamos um link de confirmação para <strong>{email}</strong>.
          </>
        ) : (
          'Enviamos um link de confirmação para o seu e-mail.'
        )}{' '}
        Abra o e-mail e clique no link para ativar sua conta. O link vale por 24 horas.
      </p>
      <p>Não recebeu? Confira o spam ou peça um novo link.</p>
      <ResendVerificationForm defaultEmail={email} {...resend} onSubmit={resend.submit} />
      <p>
        <Link to={paths.login}>Voltar para o login</Link>
      </p>
    </AuthStatus>
  );
}
