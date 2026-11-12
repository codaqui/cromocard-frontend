import type { SelectOption } from '@/components/Select/Select';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogFilterSelect.module.css';

export interface CatalogFilterSelectConfig<TName extends string> {
  name: TName;
  label: string;
  chipLabel: string;
  placeholder: string;
  icon: CatalogIconName;
  options: SelectOption[];
}

interface CatalogFilterSelectProps<TName extends string> {
  select: CatalogFilterSelectConfig<TName>;
  value: string;
  onChange: (name: TName, value: string) => void;
}

function FilterOptions({ placeholder, options }: { placeholder: string; options: SelectOption[] }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}

export function CatalogFilterSelect<TName extends string>({
  select,
  value,
  onChange,
}: CatalogFilterSelectProps<TName>) {
  return (
    <div className={styles.field}>
      <span className={styles.icon}>
        <CatalogIcon name={select.icon} size={20} />
      </span>
      <select
        aria-label={select.label}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(select.name, event.target.value)}
      >
        <FilterOptions placeholder={select.placeholder} options={select.options} />
      </select>
    </div>
  );
}
