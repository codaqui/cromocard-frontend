import { type ComponentProps, type ReactNode, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { TextField } from '@/components/TextField/TextField';

import styles from './PasswordField.module.css';

interface VisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

function VisibilityToggle({ visible, onToggle }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
      aria-pressed={visible}
      onClick={onToggle}
    >
      <Icon name={visible ? 'visibilityOff' : 'visibility'} size={20} />
    </button>
  );
}

interface PasswordFieldProps extends Omit<ComponentProps<typeof TextField>, 'type' | 'icon'> {
  aside?: ReactNode;
  revealable?: boolean;
}

export function PasswordField({ aside, revealable = true, ...fieldProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggle = <VisibilityToggle visible={visible} onToggle={() => setVisible(!visible)} />;

  return (
    <div className={styles.field}>
      <TextField
        icon="lock"
        type={visible ? 'text' : 'password'}
        endAdornment={revealable ? toggle : undefined}
        {...fieldProps}
      />
      {aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}
