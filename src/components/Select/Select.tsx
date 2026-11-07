import { type ComponentProps } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { useFieldId } from '@/hooks/useFieldId';
import { cn } from '@/utils/cn';

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
  icon?: IconName;
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

interface SelectControlProps extends ComponentProps<'select'> {
  icon?: IconName;
  options: SelectOption[];
  placeholder?: string;
}

function SelectControl({
  icon,
  options,
  placeholder,
  className,
  ...selectProps
}: SelectControlProps) {
  return (
    <div className={styles.control}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <select className={cn(styles.select, icon && styles.withIcon, className)} {...selectProps}>
        <SelectOptions options={options} placeholder={placeholder} />
      </select>
    </div>
  );
}

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  icon,
  id,
  ...selectProps
}: SelectProps) {
  const selectId = useFieldId(id);

  return (
    <FormField inputId={selectId} label={label} hint={hint} error={error}>
      <SelectControl
        id={selectId}
        icon={icon}
        options={options}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(selectId, { hint, error })}
        {...selectProps}
      />
    </FormField>
  );
}
