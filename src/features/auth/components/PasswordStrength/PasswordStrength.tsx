import { cn } from '@/utils/cn';

import styles from './PasswordStrength.module.css';
import { MAX_PASSWORD_STRENGTH } from './passwordStrength';

interface PasswordStrengthProps {
  strength: number;
}

export function PasswordStrength({ strength }: PasswordStrengthProps) {
  return (
    <div className={styles.bars} aria-hidden="true">
      {Array.from({ length: MAX_PASSWORD_STRENGTH }, (_, index) => (
        <span key={index} className={cn(styles.bar, index < strength && styles.filled)} />
      ))}
    </div>
  );
}
