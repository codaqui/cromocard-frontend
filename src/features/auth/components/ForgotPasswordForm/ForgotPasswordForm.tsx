import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';
import { TextField } from '@/components/TextField/TextField';

import type { ForgotPasswordInput } from '../../auth.schemas';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';
import styles from './ForgotPasswordForm.module.css';

function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}

interface ForgotPasswordFormProps {
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (input: ForgotPasswordInput) => void;
}

export function ForgotPasswordForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: ForgotPasswordFormProps) {
  const { register, errors, submit } = useForgotPasswordForm(onSubmit);

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <TextField
        label="E-mail"
        icon="mail"
        type="email"
        autoComplete="email"
        placeholder="seu.email@exemplo.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormError message={errorMessage} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Enviando…' : 'Enviar link de redefinição'}
        {!isSubmitting && <Icon name="arrowForward" size={20} />}
      </Button>
    </form>
  );
}
