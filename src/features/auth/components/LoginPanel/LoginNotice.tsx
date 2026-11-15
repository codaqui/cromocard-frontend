import { Link, useSearchParams } from 'react-router';

import type { ApiError } from '@/lib/api-error';
import { z } from '@/lib/zod';
import {
  checkEmailPathFor,
  EMAIL_CONFIRMED_PARAM,
  PASSWORD_CHANGED_PARAM,
  paths,
} from '@/routes/paths';

import { authErrorCodes } from '../../auth.types';
import styles from './LoginPanel.module.css';

interface LoginNoticeProps {
  error: ApiError | null;
  loginIdentifier: string;
}

function isEmail(loginIdentifier: string): boolean {
  return z.email().safeParse(loginIdentifier).success;
}

function EmailNotVerifiedNotice({
  message,
  loginIdentifier,
}: {
  message: string;
  loginIdentifier: string;
}) {
  const checkEmailPath = isEmail(loginIdentifier)
    ? checkEmailPathFor(loginIdentifier)
    : paths.checkEmail;

  return (
    <p className={styles.notice} data-tone="warning" role="alert">
      {message}. <Link to={checkEmailPath}>Reenviar confirmação</Link>
    </p>
  );
}

export function LoginNotice({ error, loginIdentifier }: LoginNoticeProps) {
  const [searchParams] = useSearchParams();

  if (error?.code === authErrorCodes.emailNotVerified) {
    return <EmailNotVerifiedNotice message={error.message} loginIdentifier={loginIdentifier} />;
  }

  if (!error && searchParams.has(PASSWORD_CHANGED_PARAM)) {
    return (
      <p className={styles.notice} data-tone="success" role="status">
        Senha alterada. Entre com a senha nova.
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
