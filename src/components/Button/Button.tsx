import type { ComponentProps } from 'react';

import { buttonClassName } from './buttonClassName';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
