import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';

import type { LoginInput } from '../../auth.schemas';
import { useLoginForm } from '../../hooks/useLoginForm';
import styles from './LoginForm.module.css';

type LoginFields = ReturnType<typeof useLoginForm>;

function EmailField({ register, errors }: Pick<LoginFields, 'register' | 'errors'>) {
  return (
    <TextField
      label="E-mail"
      type="email"
      autoComplete="email"
      placeholder="seu.email@exemplo.com"
      error={errors.email?.message}
      {...register('email')}
    />
  );
}

function PasswordField({ register, errors }: Pick<LoginFields, 'register' | 'errors'>) {
  return (
    <div className={styles.passwordField}>
      <TextField
        label="Senha"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Link to={paths.forgotPassword} className={styles.forgotLink}>
        Esqueceu a senha?
      </Link>
    </div>
  );
}

function FormError({ error }: { error: ApiError | null }) {
  if (!error || error.details) return null;

  return (
    <p className={styles.error} role="alert">
      {error.message}
    </p>
  );
}

interface LoginFormProps {
  isSubmitting: boolean;
  apiError: ApiError | null;
  onSubmit: (input: LoginInput) => void;
}

export function LoginForm({ isSubmitting, apiError, onSubmit }: LoginFormProps) {
  const { register, errors, submit } = useLoginForm(onSubmit, apiError);

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <EmailField register={register} errors={errors} />
      <PasswordField register={register} errors={errors} />
      <Checkbox label="Lembrar de mim por 30 dias" {...register('rememberMe')} />
      <FormError error={apiError} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Entrando…' : 'Entrar na Plataforma'}
      </Button>
    </form>
  );
}
