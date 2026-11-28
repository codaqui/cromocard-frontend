import { useId } from 'react';

import { cn } from '@/utils/cn';

import type { CardCondition } from '../../listings.types';
import styles from './ConditionChips.module.css';

interface ConditionChipsProps {
  options: CardCondition[];
  value: string;
  onChange: (conditionId: string) => void;
  error?: string;
}

function Chip({
  condition,
  value,
  onChange,
}: Omit<ConditionChipsProps, 'options'> & { condition: CardCondition }) {
  const selected = condition.id === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(styles.chip, selected && styles.selected)}
      onClick={() => onChange(condition.id)}
    >
      {condition.name}
    </button>
  );
}

export function ConditionChips({ options, error, ...selection }: ConditionChipsProps) {
  const labelId = useId();

  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        Condição
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className={styles.chips}>
        {options.map((condition) => (
          <Chip key={condition.id} condition={condition} {...selection} />
        ))}
      </div>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
