import { type ComponentProps, type ReactNode, useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';
import { REASON_MAX_LENGTH } from '@/lib/reason';

import styles from './ConfirmDialog.module.css';
import { useConfirmDialogForm } from './useConfirmDialogForm';

type ConfirmTone = 'primary' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: ConfirmTone;
  requireReason?: boolean;
  reasonLabel?: string;
  confirmationText?: string;
  isConfirming?: boolean;
  errorMessage?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  icon?: ReactNode;
  eyebrow?: ReactNode;
  cancelLabel?: string;
  actionsLayout?: 'end' | 'spread';
}

interface ConfirmDialogActionsProps {
  formId: string;
  confirmLabel: string;
  cancelLabel: string;
  actionsLayout: 'end' | 'spread';
  tone: ConfirmTone;
  isConfirming: boolean;
  onCancel: () => void;
}

function ConfirmDialogActions({
  formId,
  confirmLabel,
  tone,
  ...cancel
}: ConfirmDialogActionsProps) {
  const { cancelLabel, actionsLayout, isConfirming, onCancel } = cancel;

  return (
    <>
      <Button
        variant="secondary"
        className={actionsLayout === 'spread' ? styles.cancelStart : undefined}
        disabled={isConfirming}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" form={formId} variant={tone} disabled={isConfirming}>
        {isConfirming ? 'Aguarde…' : confirmLabel}
      </Button>
    </>
  );
}

function ConfirmDialogError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}

function ReasonField(props: ComponentProps<typeof Textarea>) {
  return <Textarea maxLength={REASON_MAX_LENGTH} {...props} />;
}

type ConfirmationFieldProps = Omit<ComponentProps<typeof TextField>, 'label'> & {
  expected: string;
};

function ConfirmationField({ expected, ...props }: ConfirmationFieldProps) {
  return <TextField label={`Digite "${expected}" para confirmar`} autoComplete="off" {...props} />;
}

interface ConfirmDialogFormProps {
  formId: string;
  messageId: string;
  message: ReactNode;
  requireReason: boolean;
  reasonLabel: string;
  confirmationText?: string;
  errorMessage?: string;
  onConfirm: (reason?: string) => void;
}

function ConfirmDialogForm({ formId, messageId, ...form }: ConfirmDialogFormProps) {
  const { register, errors, submit } = useConfirmDialogForm(form);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <div id={messageId} className={styles.message}>
        {form.message}
      </div>
      {form.requireReason && (
        <ReasonField
          label={form.reasonLabel}
          error={errors.reason?.message}
          {...register('reason')}
        />
      )}
      {form.confirmationText && (
        <ConfirmationField
          expected={form.confirmationText}
          error={errors.confirmation?.message}
          {...register('confirmation')}
        />
      )}
      <ConfirmDialogError message={form.errorMessage} />
    </form>
  );
}

const confirmDialogDefaults = {
  tone: 'primary',
  isConfirming: false,
  requireReason: false,
  reasonLabel: 'Motivo',
  cancelLabel: 'Cancelar',
  actionsLayout: 'end',
} satisfies Partial<ConfirmDialogProps>;

function splitConfirmDialogProps(props: Omit<ConfirmDialogProps, 'open'>) {
  const { title, icon, eyebrow, ...rest } = { ...confirmDialogDefaults, ...props };
  const { confirmLabel, cancelLabel, actionsLayout, tone, isConfirming, onCancel, ...form } = rest;
  const actions = { confirmLabel, cancelLabel, actionsLayout, tone, isConfirming, onCancel };
  return { heading: { title, icon, eyebrow }, actions, form };
}

function ConfirmDialogContent(props: Omit<ConfirmDialogProps, 'open'>) {
  const { heading, actions, form } = splitConfirmDialogProps(props);
  const formId = useId();
  const messageId = useId();

  return (
    <Modal
      open
      {...heading}
      role="alertdialog"
      descriptionId={messageId}
      dismissible={!actions.isConfirming}
      onClose={actions.onCancel}
      footer={<ConfirmDialogActions formId={formId} {...actions} />}
    >
      <ConfirmDialogForm formId={formId} messageId={messageId} {...form} />
    </Modal>
  );
}

export function ConfirmDialog({ open, ...contentProps }: ConfirmDialogProps) {
  if (!open) return null;
  return <ConfirmDialogContent {...contentProps} />;
}
