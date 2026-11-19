import styles from './SelectionCheckbox.module.css';

interface SelectionCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function SelectionCheckbox({ label, checked, onChange }: SelectionCheckboxProps) {
  return (
    <label className={styles.check}>
      <input type="checkbox" aria-label={label} checked={checked} onChange={onChange} />
    </label>
  );
}
