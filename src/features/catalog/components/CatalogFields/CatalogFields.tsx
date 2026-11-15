import { type ComponentProps, type ReactNode, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import type { SelectOption } from '@/components/Select/Select';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogFields.module.css';

interface FieldFrame {
  label: string;
  /** Ícone à esquerda do campo; os formulários do Figma usam só no álbum. */
  icon?: CatalogIconName;
  error?: string;
  /** Mostra o asterisco do Figma no rótulo e avisa o leitor de tela. */
  required?: boolean;
  /** Ícone à direita do campo, como o calendário do "Ano" no frame 833-9661. */
  iconEnd?: boolean;
}

interface IconFrameProps extends FieldFrame {
  inputId: string;
  children: ReactNode;
}

function controlClassOf({ icon, iconEnd }: Pick<FieldFrame, 'icon' | 'iconEnd'>) {
  if (!icon) return styles.plainControl;
  return iconEnd ? styles.endControl : styles.control;
}

function IconFrame({ label, icon, error, required, inputId, children, ...look }: IconFrameProps) {
  return (
    <FormField inputId={inputId} label={required ? `${label} *` : label} error={error}>
      <div className={controlClassOf({ icon, ...look })}>
        {icon && (
          <span className={styles.icon}>
            <CatalogIcon name={icon} size={20} />
          </span>
        )}
        {children}
      </div>
    </FormField>
  );
}

function fieldAria(inputId: string, { error, required }: Pick<FieldFrame, 'error' | 'required'>) {
  return {
    'aria-invalid': Boolean(error),
    'aria-required': required,
    'aria-describedby': describedByOf(inputId, { error }),
  };
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

interface IconInputProps extends FieldFrame, ComponentProps<'input'> {
  /** O check do Figma quando o campo está preenchido e sem erro (frames 278-3246 e 833-9661). */
  showValid?: boolean;
}

function ValidMark() {
  return (
    <span className={styles.valid} aria-hidden="true">
      <CatalogIcon name="checkCircle" size={20} />
    </span>
  );
}

export function IconInput({
  label,
  icon,
  iconEnd,
  error,
  required,
  showValid,
  placeholder = ' ',
  ...inputProps
}: IconInputProps) {
  const inputId = useId();

  return (
    <IconFrame {...{ label, icon, iconEnd, error, required, inputId }}>
      <input
        id={inputId}
        className={styles.input}
        placeholder={placeholder}
        {...fieldAria(inputId, { error, required })}
        {...inputProps}
      />
      {showValid && <ValidMark />}
    </IconFrame>
  );
}

/** "Descrição" numa linha só e em toda a largura, como nos formulários do catálogo no Figma. */
export function DescriptionField(props: Omit<IconInputProps, 'label'>) {
  return (
    <WideRow>
      <IconInput label="Descrição" {...props} />
    </WideRow>
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
  required,
  placeholder,
  options,
  ...selectProps
}: IconSelectProps) {
  const selectId = useId();

  return (
    <IconFrame {...{ label, icon, error, required, inputId: selectId }}>
      <select
        id={selectId}
        className={styles.input}
        {...fieldAria(selectId, { error, required })}
        {...selectProps}
      >
        <OptionList placeholder={placeholder} options={options} />
      </select>
    </IconFrame>
  );
}
