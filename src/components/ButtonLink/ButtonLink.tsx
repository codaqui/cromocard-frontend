import { Link, type LinkProps } from 'react-router';

import type { ButtonVariant } from '@/components/Button/Button';
import { buttonClassName } from '@/components/Button/buttonClassName';
import { cn } from '@/utils/cn';

import styles from './ButtonLink.module.css';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
}

export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName(variant, cn(styles.link, className))}
      data-variant={variant}
      {...props}
    />
  );
}
