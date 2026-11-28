import { cn } from '@/utils/cn';

import styles from './Button.module.css';
import type { ButtonVariant } from './Button';

export function buttonClassName(variant: ButtonVariant, className?: string) {
  return cn(styles.button, styles[variant], className);
}
