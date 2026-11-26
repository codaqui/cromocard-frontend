import {
  CONTACT_REPORT_REASONS,
  DESCRIPTION_MAX_LENGTH,
  MODERATION_OPTIONS,
  moderationOptions,
  moderationTexts,
} from '../../moderation/contact-moderation.labels';
import { reportsContact } from '../../moderation/contact-moderation.form';
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

function OptionsField({ moderation }: { moderation: ContactModeration }) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{moderationTexts.question}</legend>
      {MODERATION_OPTIONS.map((option) => (
        <OptionCard
          key={option}
          option={option}
          checked={moderation.form.option === option}
          onSelect={() => moderation.change({ option })}
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
  const { form, errors, change } = moderation;
  return (
    <div className={styles.field} role="group" aria-label={moderationTexts.reason}>
      <span className={styles.label}>{moderationTexts.reason}</span>
      <div className={styles.chips}>
        {CONTACT_REPORT_REASONS.map((reason) => (
          <ReasonChip
            key={reason}
            reason={reason}
            selected={form.reason === reason}
            onSelect={() => change({ reason })}
          />
        ))}
      </div>
      {errors.reason && (
        <p className={styles.fieldError} role="alert">
          {errors.reason}
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
        value={moderation.form.description}
        onChange={(event) => moderation.change({ description: event.target.value })}
      />
    </label>
  );
}

export function ModerationFields({ moderation }: { moderation: ContactModeration }) {
  const { form, errors, change, setErrors } = moderation;
  return (
    <>
      <OptionsField moderation={moderation} />
      {reportsContact(form.option) && (
        <>
          <ReasonField moderation={moderation} />
          <DescriptionField moderation={moderation} />
          <EvidencePicker
            files={form.evidences}
            error={errors.evidences}
            onChange={(evidences) => change({ evidences })}
            onInvalid={(message) => setErrors({ ...errors, evidences: message })}
          />
        </>
      )}
    </>
  );
}
