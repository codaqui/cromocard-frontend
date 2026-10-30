import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

import { type SignUpRole, signUpRoleLabels } from '../../auth.labels';
import { SIGN_UP_ROLES } from '../../auth.schemas';
import styles from './RoleSelector.module.css';

interface RoleSelectorProps extends Omit<ComponentProps<'input'>, 'type' | 'value'> {
  selected?: SignUpRole;
  error?: string;
}

export function RoleSelector({ selected, error, ...radioProps }: RoleSelectorProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Tipo de conta</legend>
      <div className={styles.options}>
        {SIGN_UP_ROLES.map((role) => (
          <label key={role} className={cn(styles.option, selected === role && styles.selected)}>
            <input type="radio" value={role} className={styles.radio} {...radioProps} />
            <span className={styles.title}>{signUpRoleLabels[role].title}</span>
            <span className={styles.description}>{signUpRoleLabels[role].description}</span>
          </label>
        ))}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </fieldset>
  );
}
