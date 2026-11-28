import { type ChangeEvent, useId } from 'react';

import { evidencesSchema } from '../../moderation/contact-moderation.schemas';
import { MAX_EVIDENCES, moderationTexts } from '../../moderation/contact-moderation.labels';
import styles from './ContactModerationDialog.module.css';

interface EvidencePickerProps {
  files: File[];
  error?: string;
  onChange: (files: File[]) => void;
  onInvalid: (message: string) => void;
}

const ACCEPT = 'image/png,image/jpeg,image/webp';

function EvidenceList({ files, onChange }: Pick<EvidencePickerProps, 'files' | 'onChange'>) {
  if (files.length === 0) return null;
  return (
    <ul className={styles.evidences}>
      {files.map((file, index) => (
        <li key={`${file.name}-${index}`} className={styles.evidence}>
          <span className={styles.evidenceName}>{file.name}</span>
          <button
            type="button"
            className={styles.evidenceRemove}
            aria-label={moderationTexts.removeEvidence(index + 1)}
            onClick={() => onChange(files.filter((_, at) => at !== index))}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddPrintButton({ onAdd }: { onAdd: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const inputId = useId();
  return (
    <label htmlFor={inputId} className={styles.addPrint}>
      {moderationTexts.addEvidence}
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className={styles.fileInput}
        onChange={onAdd}
      />
    </label>
  );
}

export function EvidencePicker({ files, error, onChange, onInvalid }: EvidencePickerProps) {
  const add = (event: ChangeEvent<HTMLInputElement>) => {
    const next = [...files, ...Array.from(event.target.files ?? [])];
    event.target.value = '';
    if (evidencesSchema.safeParse(next).success) onChange(next);
    else onInvalid(moderationTexts.invalidEvidence);
  };

  return (
    <div className={styles.field}>
      <div className={styles.prints}>
        {files.length < MAX_EVIDENCES && <AddPrintButton onAdd={add} />}
        <div className={styles.optionText}>
          <span className={styles.optionLabel}>{moderationTexts.evidences}</span>
          <span className={styles.optionHint}>{moderationTexts.evidencesHint}</span>
        </div>
      </div>
      <EvidenceList files={files} onChange={onChange} />
      {error && (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
