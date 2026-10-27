import { useLogin } from '../../auth.queries';
import type { LoginInput } from '../../auth.schemas';
import { useLoginRedirect } from '../../hooks/useLoginRedirect';
import { LoginForm } from '../LoginForm/LoginForm';

export function LoginPanel() {
  const login = useLogin();
  const redirectAfterLogin = useLoginRedirect();

  const submit = (input: LoginInput) =>
    login.mutate(input, { onSuccess: ({ user }) => redirectAfterLogin(user) });

  return <LoginForm isSubmitting={login.isPending} apiError={login.error} onSubmit={submit} />;
}
