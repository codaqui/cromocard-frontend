import { type ComponentProps, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import { FieldLabelRow } from '../FieldLabelRow/FieldLabelRow';
import styles from './TextInputField.module.css';

type FieldProps = ComponentProps<'input'> & ComponentProps<'textarea'>;

interface TextInputFieldProps extends Omit<FieldProps, 'value'> {
  label: string;
  error?: string;
  /** Tamanho atual do texto, para o contador "41/120" (usa o `maxLength`). */
  length?: number;
  multiline?: boolean;
  icon?: IconName;
}

function Control({ multiline, ...control }: Omit<FieldProps, 'value'> & { multiline?: boolean }) {
  if (multiline) return <textarea rows={4} className={styles.textarea} {...control} />;
  return <input className={styles.input} {...control} />;
}

/** Campo de texto do formulário de notificação, com o contador e o erro no rótulo. */
export function TextInputField({
  label,
  error,
  length,
  multiline,
  icon,
  ...props
}: TextInputFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;
  const control = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, ...props };
  const counter = length === undefined ? undefined : `${length}/${props.maxLength}`;

  return (
    <div className={styles.field}>
      <FieldLabelRow htmlFor={id} label={label} counter={counter} error={error} errorId={errorId} />
      <span className={icon ? styles.withIcon : undefined}>
        {icon && <Icon name={icon} size={18} />}
        <Control multiline={multiline} {...control} />
      </span>
    </div>
  );
}
