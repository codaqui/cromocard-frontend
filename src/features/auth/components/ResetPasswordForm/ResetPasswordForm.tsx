import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import type { ApiError } from '@/lib/api-error';

import type { ResetPasswordInput } from '../../auth.schemas';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';
import { NewPasswordField } from '../NewPasswordField/NewPasswordField';
import { PasswordField } from '../PasswordField/PasswordField';
import styles from './ResetPasswordForm.module.css';

type ResetFields = ReturnType<typeof useResetPasswordForm>;

function ConfirmPassword({ register, errors }: Pick<ResetFields, 'register' | 'errors'>) {
  return (
    <PasswordField
      label="Confirmar senha nova"
      autoComplete="new-password"
      placeholder="Repita a senha nova"
      revealable={false}
      error={errors.confirmPassword?.message}
      {...register('confirmPassword')}
    />
  );
}

interface ResetPasswordFormProps {
  isSubmitting: boolean;
  apiError: ApiError | null;
  onSubmit: (input: ResetPasswordInput) => void;
}

export function ResetPasswordForm({ isSubmitting, apiError, onSubmit }: ResetPasswordFormProps) {
  const { register, errors, submit, password, formError } = useResetPasswordForm(
    onSubmit,
    apiError,
  );

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <NewPasswordField
        label="Senha nova"
        password={password}
        error={errors.password?.message}
        {...register('password')}
      />
      <ConfirmPassword register={register} errors={errors} />
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Salvando…' : 'Salvar senha nova'}
      </Button>
    </form>
  );
}
