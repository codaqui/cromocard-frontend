import type { UseFormRegisterReturn } from 'react-hook-form';

import { PasswordField } from '../PasswordField/PasswordField';
import { PasswordStrength } from '../PasswordStrength/PasswordStrength';
import { passwordStrength, passwordStrengthLabel } from '../PasswordStrength/passwordStrength';
import styles from './NewPasswordField.module.css';

interface NewPasswordFieldProps extends UseFormRegisterReturn {
  label: string;
  password: string;
  error?: string;
}

export function NewPasswordField({
  label,
  password,
  error,
  ...registration
}: NewPasswordFieldProps) {
  const strength = passwordStrength(password);

  return (
    <div>
      <PasswordField
        label={label}
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres, com letra, número e símbolo"
        error={error}
        aside={<span className={styles.strengthLabel}>{passwordStrengthLabel(strength)}</span>}
        {...registration}
      />
      <PasswordStrength strength={strength} />
    </div>
  );
}
