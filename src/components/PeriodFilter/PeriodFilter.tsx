import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { TextField } from '@/components/TextField/TextField';
import { cn } from '@/utils/cn';

import styles from './PeriodFilter.module.css';

export type PeriodPreset = 'today' | '7d' | '30d' | '1y';

export interface DateRange {
  from: string;
  to: string;
}

export type Period = { preset: PeriodPreset } | DateRange;

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
}

const presetOptions: { value: PeriodPreset; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '1y', label: '1 ano' },
];

const isDateRange = (period: Period): period is DateRange => 'from' in period;

interface PresetButtonProps {
  label: string;
  pressed: boolean;
  onClick: () => void;
}

function PresetButton({ label, pressed, onClick }: PresetButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(styles.preset, pressed && styles.pressed)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function useDateRange(initial?: DateRange) {
  const [from, setFrom] = useState(initial?.from ?? '');
  const [to, setTo] = useState(initial?.to ?? '');
  const isInverted = Boolean(from && to && from > to);
  const canApply = Boolean(from && to) && !isInverted;

  return { from, to, setFrom, setTo, isInverted, canApply };
}

interface CustomRangeProps {
  initial?: DateRange;
  onApply: (range: DateRange) => void;
}

function CustomRange({ initial, onApply }: CustomRangeProps) {
  const { from, to, setFrom, setTo, isInverted, canApply } = useDateRange(initial);

  return (
    <div className={styles.range}>
      <TextField
        label="De"
        type="date"
        value={from}
        onChange={(event) => setFrom(event.target.value)}
      />
      <TextField
        label="Até"
        type="date"
        value={to}
        error={isInverted ? 'A data final precisa ser igual ou depois da inicial' : undefined}
        onChange={(event) => setTo(event.target.value)}
      />
      <Button variant="secondary" disabled={!canApply} onClick={() => onApply({ from, to })}>
        Aplicar
      </Button>
    </div>
  );
}

interface PresetGroupProps {
  activePreset?: PeriodPreset;
  isCustomOpen: boolean;
  onSelectPreset: (preset: PeriodPreset) => void;
  onOpenCustom: () => void;
}

function PresetGroup({
  activePreset,
  isCustomOpen,
  onSelectPreset,
  onOpenCustom,
}: PresetGroupProps) {
  return (
    <div role="group" aria-label="Período" className={styles.presets}>
      {presetOptions.map((option) => (
        <PresetButton
          key={option.value}
          label={option.label}
          pressed={option.value === activePreset}
          onClick={() => onSelectPreset(option.value)}
        />
      ))}
      <PresetButton label="Personalizado" pressed={isCustomOpen} onClick={onOpenCustom} />
    </div>
  );
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(isDateRange(value));
  const activePreset = !isCustomOpen && !isDateRange(value) ? value.preset : undefined;

  const selectPreset = (preset: PeriodPreset) => {
    setIsCustomOpen(false);
    onChange({ preset });
  };

  return (
    <div className={styles.filter}>
      <PresetGroup
        activePreset={activePreset}
        isCustomOpen={isCustomOpen}
        onSelectPreset={selectPreset}
        onOpenCustom={() => setIsCustomOpen(true)}
      />
      {isCustomOpen && (
        <CustomRange initial={isDateRange(value) ? value : undefined} onApply={onChange} />
      )}
    </div>
  );
}
