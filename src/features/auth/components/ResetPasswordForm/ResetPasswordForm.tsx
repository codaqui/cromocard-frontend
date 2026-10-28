import { Button } from '@/components/Button/Button';

import type { ResetPasswordInput } from '../../auth.schemas';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';
import { PasswordField } from '../PasswordField/PasswordField';
import { PasswordStrength } from '../PasswordStrength/PasswordStrength';
import { passwordStrength, passwordStrengthLabel } from '../PasswordStrength/passwordStrength';
import styles from './ResetPasswordForm.module.css';

type ResetFields = ReturnType<typeof useResetPasswordForm>;

function NewPassword({ register, errors, password }: Omit<ResetFields, 'submit'>) {
  const strength = passwordStrength(password);

  return (
    <div>
      <PasswordField
        label="Senha nova"
        autoComplete="new-password"
        placeholder="Mínimo 8 dígitos com números e símbolos"
        error={errors.password?.message}
        aside={<span className={styles.strengthLabel}>{passwordStrengthLabel(strength)}</span>}
        {...register('password')}
      />
      <PasswordStrength strength={strength} />
    </div>
  );
}

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
  errorMessage?: string;
  onSubmit: (input: ResetPasswordInput) => void;
}

export function ResetPasswordForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: ResetPasswordFormProps) {
  const { register, errors, submit, password } = useResetPasswordForm(onSubmit);

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <NewPassword register={register} errors={errors} password={password} />
      <ConfirmPassword register={register} errors={errors} />
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? 'Salvando…' : 'Salvar senha nova'}
      </Button>
    </form>
  );
}
