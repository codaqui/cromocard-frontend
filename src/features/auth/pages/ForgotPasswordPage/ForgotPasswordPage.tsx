import { Link } from 'react-router';

import { paths } from '@/routes/paths';

import { useForgotPassword } from '../../auth.queries';
import { AuthHeading } from '../../components/AuthHeading/AuthHeading';
import { AuthStatus } from '../../components/AuthStatus/AuthStatus';
import { ForgotPasswordForm } from '../../components/ForgotPasswordForm/ForgotPasswordForm';
import styles from './ForgotPasswordPage.module.css';

function BackToLogin() {
  return (
    <p className={styles.back}>
      <Link to={paths.login}>Voltar para o login</Link>
    </p>
  );
}

function RequestSent() {
  return (
    <AuthStatus tone="info" title="Confira seu e-mail">
      <p>
        Se houver uma conta com esse e-mail, enviamos um link para criar uma senha nova. O link vale
        por 1 hora e só pode ser usado uma vez.
      </p>
      <BackToLogin />
    </AuthStatus>
  );
}

export function ForgotPasswordPage() {
  const forgot = useForgotPassword();

  if (forgot.isSuccess) return <RequestSent />;

  return (
    <section className={styles.page}>
      <AuthHeading
        title="Esqueceu sua senha?"
        description="Informe o e-mail da sua conta e enviaremos um link para você criar uma senha nova."
      />
      <ForgotPasswordForm
        isSubmitting={forgot.isPending}
        apiError={forgot.error}
        onSubmit={(input) => forgot.mutate(input)}
      />
      <BackToLogin />
    </section>
  );
}
