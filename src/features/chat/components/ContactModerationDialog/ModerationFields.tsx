import type { FieldPath, PathValue } from 'react-hook-form';

import {
  CONTACT_REPORT_REASONS,
  DESCRIPTION_MAX_LENGTH,
  MODERATION_OPTIONS,
  moderationOptions,
  moderationTexts,
} from '../../moderation/contact-moderation.labels';
import {
  type ContactModerationValues,
  reportsContact,
} from '../../moderation/contact-moderation.schemas';
import type {
  ContactReportReason,
  ModerationOption,
} from '../../moderation/contact-moderation.types';
import { cn } from '@/utils/cn';

import { EvidencePicker } from './EvidencePicker';
import type { ContactModeration } from './useContactModeration';
import styles from './ContactModerationDialog.module.css';

interface OptionCardProps {
  option: ModerationOption;
  checked: boolean;
  onSelect: () => void;
}

function OptionCard({ option, checked, onSelect }: OptionCardProps) {
  const { label, hint } = moderationOptions[option];
  return (
    <label className={cn(styles.option, checked && styles.optionChecked)}>
      <input
        type="radio"
        name="moderation-option"
        className={styles.radio}
        checked={checked}
        onChange={onSelect}
      />
      <span className={styles.optionText}>
        <span className={styles.optionLabel}>{label}</span>
        <span className={styles.optionHint}>{hint}</span>
      </span>
    </label>
  );
}

function useFieldSetter({ form }: ContactModeration) {
  return <K extends FieldPath<ContactModerationValues>>(
    field: K,
    value: PathValue<ContactModerationValues, K>,
  ) => form.setValue(field, value, { shouldValidate: form.formState.isSubmitted });
}

function OptionsField({ moderation }: { moderation: ContactModeration }) {
  const set = useFieldSetter(moderation);
  const selected = moderation.form.watch('option');
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{moderationTexts.question}</legend>
      {MODERATION_OPTIONS.map((option) => (
        <OptionCard
          key={option}
          option={option}
          checked={selected === option}
          onSelect={() => set('option', option)}
        />
      ))}
    </fieldset>
  );
}

function ReasonChip({
  reason,
  selected,
  onSelect,
}: {
  reason: ContactReportReason;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(styles.chip, selected && styles.chipSelected)}
      onClick={onSelect}
    >
      {reason}
    </button>
  );
}

function ReasonField({ moderation }: { moderation: ContactModeration }) {
  const set = useFieldSetter(moderation);
  const selected = moderation.form.watch('reason');
  const error = moderation.form.formState.errors.reason?.message;
  return (
    <div className={styles.field} role="group" aria-label={moderationTexts.reason}>
      <span className={styles.label}>{moderationTexts.reason}</span>
      <div className={styles.chips}>
        {CONTACT_REPORT_REASONS.map((reason) => (
          <ReasonChip
            key={reason}
            reason={reason}
            selected={selected === reason}
            onSelect={() => set('reason', reason)}
          />
        ))}
      </div>
      {error && (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function DescriptionField({ moderation }: { moderation: ContactModeration }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{moderationTexts.description}</span>
      <input
        className={styles.input}
        maxLength={DESCRIPTION_MAX_LENGTH}
        {...moderation.form.register('description')}
      />
    </label>
  );
}

function EvidencesField({ moderation }: { moderation: ContactModeration }) {
  const { form } = moderation;
  const set = useFieldSetter(moderation);
  return (
    <EvidencePicker
      files={form.watch('evidences')}
      error={form.formState.errors.evidences?.message}
      onChange={(evidences) => set('evidences', evidences)}
      onInvalid={(message) => form.setError('evidences', { message })}
    />
  );
}

export function ModerationFields({ moderation }: { moderation: ContactModeration }) {
  return (
    <>
      <OptionsField moderation={moderation} />
      {reportsContact(moderation.form.watch('option')) && (
        <>
          <ReasonField moderation={moderation} />
          <DescriptionField moderation={moderation} />
          <EvidencesField moderation={moderation} />
        </>
      )}
    </>
  );
}
