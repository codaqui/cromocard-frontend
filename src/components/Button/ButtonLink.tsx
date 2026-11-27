import { Link, type LinkProps } from 'react-router';

import { cn } from '@/utils/cn';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={cn(styles.button, styles.link, styles[variant], className)} {...props} />;
}
