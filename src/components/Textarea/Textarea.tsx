import { type ComponentProps, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { type FieldLabelOptions, FormField } from '@/components/FormField/FormField';

import styles from './Textarea.module.css';

interface TextareaProps extends ComponentProps<'textarea'>, FieldLabelOptions {
  label: string;
  hint?: string;
  error?: string;
}

function splitLabelOptions({ hideLabel, labelAside, plainLabel, ...rest }: TextareaFieldProps) {
  return { labelOptions: { hideLabel, labelAside, plainLabel }, textareaProps: rest };
}

type TextareaFieldProps = Omit<TextareaProps, 'label' | 'hint' | 'error' | 'id' | 'rows'>;

export function Textarea({ label, hint, error, id, rows = 4, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const { labelOptions, textareaProps } = splitLabelOptions(props);

  return (
    <FormField inputId={textareaId} label={label} hint={hint} error={error} {...labelOptions}>
      <textarea
        id={textareaId}
        rows={rows}
        className={styles.textarea}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(textareaId, { hint, error })}
        {...textareaProps}
      />
    </FormField>
  );
}
