import { type ComponentProps, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectControlProps extends ComponentProps<'select'> {
  options: SelectOption[];
  placeholder?: string;
  icon?: IconName;
}

interface SelectProps extends SelectControlProps {
  label: string;
  hint?: string;
  error?: string;
}

function SelectOptions({ options, placeholder }: Pick<SelectProps, 'options' | 'placeholder'>) {
  return (
    <>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

function SelectControl({ options, placeholder, icon, ...selectProps }: SelectControlProps) {
  return (
    <div className={styles.control}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <select className={cn(styles.select, icon && styles.withIcon)} {...selectProps}>
        <SelectOptions options={options} placeholder={placeholder} />
      </select>
    </div>
  );
}

export function Select({ label, hint, error, id, ...controlProps }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField inputId={selectId} label={label} hint={hint} error={error}>
      <SelectControl
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(selectId, { hint, error })}
        {...controlProps}
      />
    </FormField>
  );
}
