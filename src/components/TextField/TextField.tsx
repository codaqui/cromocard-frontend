import { type ComponentProps, type ReactNode, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './TextField.module.css';

interface InputControlProps extends ComponentProps<'input'> {
  icon?: IconName;
  endAdornment?: ReactNode;
}

interface TextFieldProps extends InputControlProps {
  label: string;
  hint?: string;
  error?: string;
}

function InputControl({ icon, endAdornment, className, ...inputProps }: InputControlProps) {
  return (
    <div className={styles.control}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <input
        className={cn(
          styles.input,
          icon && styles.withIcon,
          Boolean(endAdornment) && styles.withEnd,
          className,
        )}
        {...inputProps}
      />
      {endAdornment && <span className={styles.end}>{endAdornment}</span>}
    </div>
  );
}

export function TextField({ label, hint, error, id, ...controlProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField inputId={inputId} label={label} hint={hint} error={error}>
      <InputControl
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(inputId, { hint, error })}
        {...controlProps}
      />
    </FormField>
  );
}
