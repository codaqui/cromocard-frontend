import { Select, type SelectOption } from '@/components/Select/Select';

export interface CatalogFilterSelect<TName extends string> {
  name: TName;
  label: string;
  placeholder: string;
  options: SelectOption[];
}

interface CatalogFilterSelectsProps<TName extends string> {
  selects: CatalogFilterSelect<TName>[];
  values: Record<TName, string>;
  onChange: (name: TName, value: string) => void;
}

export function CatalogFilterSelects<TName extends string>({
  selects,
  values,
  onChange,
}: CatalogFilterSelectsProps<TName>) {
  return selects.map((select) => (
    <Select
      key={select.name}
      label={select.label}
      placeholder={select.placeholder}
      options={select.options}
      value={values[select.name]}
      onChange={(event) => onChange(select.name, event.target.value)}
    />
  ));
}
