import { Link, Navigate, useSearchParams } from 'react-router';

import { loginAfterPasswordChangedPath, paths } from '@/routes/paths';

import { useResetPassword } from '../../auth.queries';
import { AuthHeading } from '../../components/AuthHeading/AuthHeading';
import { AuthStatus } from '../../components/AuthStatus/AuthStatus';
import { ResetPasswordForm } from '../../components/ResetPasswordForm/ResetPasswordForm';
import styles from './ResetPasswordPage.module.css';

const INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN';

function InvalidResetLink() {
  return (
    <AuthStatus tone="danger" title="Link inválido ou expirado">
      <p>
        Este link de redefinição não vale mais: ele expira em 1 hora e só pode ser usado uma vez.
      </p>
      <p>
        <Link to={paths.forgotPassword}>Pedir um novo link</Link>
      </p>
    </AuthStatus>
  );
}

export function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token') ?? '';
  const reset = useResetPassword();

  if (!token || reset.error?.code === INVALID_RESET_TOKEN) return <InvalidResetLink />;
  if (reset.isSuccess) return <Navigate to={loginAfterPasswordChangedPath} replace />;

  return (
    <section className={styles.page}>
      <AuthHeading
        title="Crie uma senha nova"
        description="Use pelo menos 8 caracteres, com letra, número e símbolo. Depois de salvar, as sessões abertas são encerradas."
      />
      <ResetPasswordForm
        isSubmitting={reset.isPending}
        errorMessage={reset.error?.details ? undefined : reset.error?.message}
        onSubmit={({ password }) => reset.mutate({ token, password })}
      />
    </section>
  );
}
