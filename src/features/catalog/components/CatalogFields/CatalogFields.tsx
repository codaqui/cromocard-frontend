import { type ComponentProps, type ReactNode, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import type { SelectOption } from '@/components/Select/Select';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogFields.module.css';

interface FieldFrame {
  label: string;
  icon: CatalogIconName;
  error?: string;
}

interface IconFrameProps extends FieldFrame {
  inputId: string;
  children: ReactNode;
}

function IconFrame({ label, icon, error, inputId, children }: IconFrameProps) {
  return (
    <FormField inputId={inputId} label={label} error={error}>
      <div className={styles.control}>
        <span className={styles.icon}>
          <CatalogIcon name={icon} size={20} />
        </span>
        {children}
      </div>
    </FormField>
  );
}

function fieldAria(inputId: string, error?: string) {
  return { 'aria-invalid': Boolean(error), 'aria-describedby': describedByOf(inputId, { error }) };
}

function OptionList({ placeholder, options }: { placeholder: string; options: SelectOption[] }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export function WideRow({ children }: { children: ReactNode }) {
  return <div className={styles.wide}>{children}</div>;
}

type IconInputProps = FieldFrame & ComponentProps<'input'>;

export function IconInput({ label, icon, error, ...inputProps }: IconInputProps) {
  const inputId = useId();

  return (
    <IconFrame label={label} icon={icon} error={error} inputId={inputId}>
      <input id={inputId} className={styles.input} {...fieldAria(inputId, error)} {...inputProps} />
    </IconFrame>
  );
}

interface IconSelectProps extends FieldFrame, ComponentProps<'select'> {
  placeholder: string;
  options: SelectOption[];
}

export function IconSelect({
  label,
  icon,
  error,
  placeholder,
  options,
  ...selectProps
}: IconSelectProps) {
  const selectId = useId();

  return (
    <IconFrame label={label} icon={icon} error={error} inputId={selectId}>
      <select
        id={selectId}
        className={styles.input}
        {...fieldAria(selectId, error)}
        {...selectProps}
      >
        <OptionList placeholder={placeholder} options={options} />
      </select>
    </IconFrame>
  );
}
