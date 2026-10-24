import { type ComponentProps, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';

import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends ComponentProps<'select'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
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

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField inputId={selectId} label={label} hint={hint} error={error}>
      <select
        id={selectId}
        className={styles.select}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(selectId, { hint, error })}
        {...selectProps}
      >
        <SelectOptions options={options} placeholder={placeholder} />
      </select>
    </FormField>
  );
}
