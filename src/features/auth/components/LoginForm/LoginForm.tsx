import { type ChangeEvent, useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Checkbox } from '@/components/Checkbox/Checkbox';
import { Icon } from '@/components/Icon/Icon';
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
      icon="mail"
      type="email"
      autoComplete="email"
      placeholder="seu.email@exemplo.com"
      error={errors.email?.message}
      {...register('email')}
    />
  );
}

function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.visibilityToggle}
      aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
      aria-pressed={visible}
      onClick={onToggle}
    >
      <Icon name={visible ? 'visibilityOff' : 'visibility'} size={20} />
    </button>
  );
}

function PasswordField({ register, errors }: Pick<LoginFields, 'register' | 'errors'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordField}>
      <TextField
        label="Senha"
        icon="lock"
        endAdornment={
          <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />
        }
        type={visible ? 'text' : 'password'}
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

interface LoginFormProps {
  isSubmitting: boolean;
  apiError: ApiError | null;
  onSubmit: (input: LoginInput) => void;
  onRememberMeChange?: (rememberMe: boolean) => void;
}

export function LoginForm({
  isSubmitting,
  apiError,
  onSubmit,
  onRememberMeChange,
}: LoginFormProps) {
  const { register, errors, submit, formError } = useLoginForm(onSubmit, apiError);
  const rememberMe = register('rememberMe', {
    onChange: (event: ChangeEvent<HTMLInputElement>) => onRememberMeChange?.(event.target.checked),
  });

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <EmailField register={register} errors={errors} />
      <PasswordField register={register} errors={errors} />
      <div className={styles.remember}>
        <Checkbox label="Lembrar de mim por 30 dias" {...rememberMe} />
      </div>
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Entrando…' : 'Entrar na Plataforma'}
        {!isSubmitting && <Icon name="arrowForward" size={20} />}
      </Button>
    </form>
  );
}
