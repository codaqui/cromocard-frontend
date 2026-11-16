import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Textarea } from '@/components/Textarea/Textarea';
import { REASON_MAX_LENGTH } from '@/lib/reason';
import { cn } from '@/utils/cn';

import { sanctionLabels, type SanctionType, warningsLabel } from '../../users.labels';
import { useBlockUser, useSuspendUser, useWarnUser } from '../../users.queries';
import { SUSPENSION_DAY_OPTIONS } from '../../users.types';
import { type SanctionFormValues, useSanctionForm } from './useSanctionForm';
import styles from './SanctionDialog.module.css';

export interface SanctionTarget {
  id: string;
  name: string;
  username: string | null;
  warningsCount: number;
  reportId?: string;
}

export type SanctionSavedKind = 'warn' | 'suspend' | 'block';

interface SanctionDialogProps {
  target: SanctionTarget | null;
  onClose: () => void;
  onSaved: (kind: SanctionSavedKind) => void;
}

function useSanctionMutation() {
  const warn = useWarnUser();
  const suspend = useSuspendUser();
  const block = useBlockUser();
  return { warn, suspend, block };
}

function useSubmitSanction(target: SanctionTarget, onSaved: (kind: SanctionSavedKind) => void) {
  const { warn, suspend, block } = useSanctionMutation();
  const isPending = warn.isPending || suspend.isPending || block.isPending;
  const error = warn.error ?? suspend.error ?? block.error;

  const submit = ({ type, days, reason }: SanctionFormValues) => {
    const { id, reportId } = target;
    if (type === 'WARN') {
      warn.mutate({ id, input: { reason, reportId } }, { onSuccess: () => onSaved('warn') });
    } else if (type === 'SUSPEND') {
      suspend.mutate({ id, input: { reason, days } }, { onSuccess: () => onSaved('suspend') });
    } else {
      block.mutate({ id, input: { reason } }, { onSuccess: () => onSaved('block') });
    }
  };

  return { submit, isPending, errorMessage: error?.message };
}

function SanctionOption({
  type,
  selected,
  onSelect,
}: {
  type: SanctionType;
  selected: boolean;
  onSelect: () => void;
}) {
  const { title, description } = sanctionLabels[type];
  return (
    <label className={cn(styles.option, selected && styles.optionSelected)}>
      <input
        type="radio"
        name="sanction-type"
        checked={selected}
        onChange={onSelect}
        className={styles.optionInput}
      />
      <span className={styles.optionTitle}>{title}</span>
      <span className={styles.optionDescription}>{description}</span>
    </label>
  );
}

const SANCTION_TYPES: SanctionType[] = ['WARN', 'SUSPEND', 'BLOCK'];

function DayOption({
  day,
  selected,
  onSelect,
}: {
  day: SanctionFormValues['days'];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(styles.dayOption, selected && styles.dayOptionSelected)}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {day} dias
    </button>
  );
}

function SuspensionDays({
  days,
  onSelect,
}: {
  days: SanctionFormValues['days'];
  onSelect: (days: SanctionFormValues['days']) => void;
}) {
  return (
    <div>
      <p className={styles.fieldLabel}>Prazo da suspensão</p>
      <div className={styles.dayOptions} role="group" aria-label="Prazo da suspensão">
        {SUSPENSION_DAY_OPTIONS.map((option) => (
          <DayOption
            key={option}
            day={option}
            selected={option === days}
            onSelect={() => onSelect(option)}
          />
        ))}
      </div>
    </div>
  );
}

const FORM_ID = 'sanction-form';

function SanctionDialogActions({
  isPending,
  onClose,
}: {
  isPending: boolean;
  onClose: () => void;
}) {
  return (
    <div className={styles.footer}>
      <Button variant="secondary" disabled={isPending} onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={FORM_ID} variant="danger" disabled={isPending}>
        {isPending ? 'Aguarde…' : 'Aplicar sanção'}
      </Button>
    </div>
  );
}

function subtitleFor(target: SanctionTarget): string {
  const handle = target.username ? ` (@${target.username})` : '';
  return `${target.name}${handle} • ${warningsLabel(target.warningsCount)}`;
}

type SanctionFormApi = ReturnType<typeof useSanctionForm>;

function SanctionTypeOptions({ form }: { form: SanctionFormApi }) {
  return (
    <div className={styles.options}>
      {SANCTION_TYPES.map((type) => (
        <SanctionOption
          key={type}
          type={type}
          selected={form.type === type}
          onSelect={() => form.setType(type)}
        />
      ))}
    </div>
  );
}

function SanctionDialogFields({
  form,
  errorMessage,
}: {
  form: SanctionFormApi;
  errorMessage?: string;
}) {
  return (
    <>
      <SanctionTypeOptions form={form} />
      {form.type === 'SUSPEND' && <SuspensionDays days={form.days} onSelect={form.setDays} />}
      <Textarea
        label="Justificativa (obrigatória)"
        maxLength={REASON_MAX_LENGTH}
        error={form.errors.reason?.message}
        {...form.register('reason')}
      />
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </>
  );
}

function SanctionDialogContent({
  target,
  onClose,
  onSaved,
}: SanctionDialogProps & { target: SanctionTarget }) {
  const { submit, isPending, errorMessage } = useSubmitSanction(target, onSaved);
  const form = useSanctionForm({ onSubmit: submit });

  return (
    <Modal
      open
      title="Aplicar sanção"
      subtitle={subtitleFor(target)}
      onClose={onClose}
      dismissible={!isPending}
      footer={<SanctionDialogActions isPending={isPending} onClose={onClose} />}
    >
      <form id={FORM_ID} className={styles.form} noValidate onSubmit={form.submit}>
        <SanctionDialogFields form={form} errorMessage={errorMessage} />
      </form>
    </Modal>
  );
}

export function SanctionDialog({ target, ...props }: SanctionDialogProps) {
  if (!target) return null;
  return <SanctionDialogContent target={target} {...props} />;
}
