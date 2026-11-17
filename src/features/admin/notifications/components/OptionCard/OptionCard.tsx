import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './OptionCard.module.css';

interface OptionCardProps extends Omit<ComponentProps<'input'>, 'type'> {
  type: 'radio' | 'checkbox';
  label: string;
  hint: string;
  icon?: ReactNode;
}

/** Opção em cartão do formulário (público, canais e quando enviar), como no frame 208-2380. */
export function OptionCard({ type, label, hint, icon, className, ...inputProps }: OptionCardProps) {
  return (
    <label className={cn(styles.card, className)}>
      <input type={type} className={styles.input} {...inputProps} />
      <span className={styles.texts}>
        <span className={styles.label}>
          {icon}
          {label}
        </span>
        <span className={styles.hint}>{hint}</span>
      </span>
    </label>
  );
}
