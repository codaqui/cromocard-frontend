import { cn } from '@/utils/cn';

import styles from './Switch.module.css';

interface SwitchProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Switch({ label, checked, disabled = false, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      className={cn(styles.switch, checked && styles.on)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}
