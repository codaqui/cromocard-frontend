import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

import styles from './Button.module.css';
import type { ButtonVariant } from './ButtonLink';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(styles.button, styles[variant], className)} {...props} />
  );
}
