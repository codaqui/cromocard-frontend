import { Link, useNavigate } from 'react-router';

import type { ApiError } from '@/lib/api-error';
import { checkEmailPathFor, paths } from '@/routes/paths';

import { useRegister } from '../../auth.queries';
import type { RegisterInput } from '../../auth.schemas';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import styles from './RegisterPanel.module.css';

interface RegisterErrorProps {
  error: ApiError | null;
  email: string;
}

function RegisterError({ error, email }: RegisterErrorProps) {
  if (!error || error.details) return null;

  return (
    <div className={styles.error} role="alert">
      <p>{error.message}</p>
      {error.code === 'EMAIL_ALREADY_REGISTERED' && (
        <p className={styles.actions}>
          <Link to={paths.login}>Entrar na conta</Link>
          <Link to={checkEmailPathFor(email)}>Reenviar confirmação</Link>
        </p>
      )}
    </div>
  );
}

export function RegisterPanel() {
  const registration = useRegister();
  const navigate = useNavigate();

  const submit = (input: RegisterInput) =>
    registration.mutate(input, {
      onSuccess: ({ email }) => void navigate(checkEmailPathFor(email)),
    });

  return (
    <>
      <RegisterError error={registration.error} email={registration.variables?.email ?? ''} />
      <RegisterForm
        isSubmitting={registration.isPending}
        apiError={registration.error}
        onSubmit={submit}
      />
    </>
  );
}
