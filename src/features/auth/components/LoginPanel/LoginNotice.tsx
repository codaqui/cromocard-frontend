import { Link, useSearchParams } from 'react-router';

import type { ApiError } from '@/lib/api-error';
import { checkEmailPathFor, EMAIL_CONFIRMED_PARAM } from '@/routes/paths';

import styles from './LoginPanel.module.css';

interface LoginNoticeProps {
  error: ApiError | null;
  email: string;
}

export function LoginNotice({ error, email }: LoginNoticeProps) {
  const [searchParams] = useSearchParams();

  if (error?.code === 'EMAIL_NOT_VERIFIED') {
    return (
      <p className={styles.notice} data-tone="warning" role="alert">
        {error.message}. <Link to={checkEmailPathFor(email)}>Reenviar confirmação</Link>
      </p>
    );
  }

  if (!error && searchParams.has(EMAIL_CONFIRMED_PARAM)) {
    return (
      <p className={styles.notice} data-tone="success" role="status">
        E-mail confirmado. Agora é só entrar.
      </p>
    );
  }

  return null;
}
