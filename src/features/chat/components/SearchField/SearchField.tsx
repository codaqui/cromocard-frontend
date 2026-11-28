import type { ReactNode, Ref } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import styles from './SearchField.module.css';

interface SearchFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  outlined?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  hint?: ReactNode;
}

export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  outlined = false,
  inputRef,
  hint,
}: SearchFieldProps) {
  return (
    <label className={cn(styles.search, outlined && styles.outlined)}>
      <Icon name="search" size={16} />
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint}
    </label>
  );
}
