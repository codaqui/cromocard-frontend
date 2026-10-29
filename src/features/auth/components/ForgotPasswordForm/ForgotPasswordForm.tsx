import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import type { ForgotPasswordInput } from '../../auth.schemas';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';
import styles from './ForgotPasswordForm.module.css';

interface ForgotPasswordFormProps {
  isSubmitting: boolean;
  apiError: ApiError | null;
  onSubmit: (input: ForgotPasswordInput) => void;
}

export function ForgotPasswordForm({ isSubmitting, apiError, onSubmit }: ForgotPasswordFormProps) {
  const { register, errors, submit, formError } = useForgotPasswordForm(onSubmit, apiError);

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
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Enviando…' : 'Enviar link de redefinição'}
        {!isSubmitting && <Icon name="arrowForward" size={20} />}
      </Button>
    </form>
  );
}
