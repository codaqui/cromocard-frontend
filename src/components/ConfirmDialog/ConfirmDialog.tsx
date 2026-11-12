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
  extraFields?: ReactNode;
  canConfirm?: boolean;
  isConfirming?: boolean;
  errorMessage?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

interface ConfirmDialogActionsProps {
  formId: string;
  confirmLabel: string;
  tone: ConfirmTone;
  isConfirming: boolean;
  disabled: boolean;
  onCancel: () => void;
}

function ConfirmDialogActions({
  formId,
  confirmLabel,
  tone,
  isConfirming,
  disabled,
  onCancel,
}: ConfirmDialogActionsProps) {
  return (
    <>
      <Button variant="secondary" disabled={isConfirming} onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} variant={tone} disabled={disabled}>
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

interface ConfirmDialogFieldsProps {
  requireReason: boolean;
  reasonLabel: string;
  confirmationText?: string;
  extraFields?: ReactNode;
  errorMessage?: string;
  register: ReturnType<typeof useConfirmDialogForm>['register'];
  errors: ReturnType<typeof useConfirmDialogForm>['errors'];
}

function ReasonAndConfirmationFields({
  requireReason,
  reasonLabel,
  confirmationText,
  register,
  errors,
}: Omit<ConfirmDialogFieldsProps, 'extraFields' | 'errorMessage'>) {
  return (
    <>
      {requireReason && (
        <ReasonField label={reasonLabel} error={errors.reason?.message} {...register('reason')} />
      )}
      {confirmationText && (
        <ConfirmationField
          expected={confirmationText}
          error={errors.confirmation?.message}
          {...register('confirmation')}
        />
      )}
    </>
  );
}

function ConfirmDialogFields({ extraFields, errorMessage, ...fields }: ConfirmDialogFieldsProps) {
  return (
    <>
      <ReasonAndConfirmationFields {...fields} />
      {extraFields}
      <ConfirmDialogError message={errorMessage} />
    </>
  );
}

interface ConfirmDialogFormProps extends ConfirmDialogFieldsProps {
  formId: string;
  messageId: string;
  message: ReactNode;
  submit: ReturnType<typeof useConfirmDialogForm>['submit'];
}

function ConfirmDialogForm({
  formId,
  messageId,
  message,
  submit,
  ...fields
}: ConfirmDialogFormProps) {
  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <div id={messageId} className={styles.message}>
        {message}
      </div>
      <ConfirmDialogFields {...fields} />
    </form>
  );
}

const confirmDialogDefaults = {
  tone: 'primary',
  isConfirming: false,
  requireReason: false,
  reasonLabel: 'Motivo',
  canConfirm: true,
} satisfies Partial<ConfirmDialogProps>;

function useConfirmDialog(props: Omit<ConfirmDialogProps, 'open'>) {
  const form = { ...confirmDialogDefaults, ...props };
  const { confirmationPending, ...rest } = useConfirmDialogForm(form);
  const disabled = form.isConfirming || confirmationPending || !form.canConfirm;
  return { ...rest, disabled, formId: useId(), messageId: useId(), ...form };
}

function ConfirmDialogContent(props: Omit<ConfirmDialogProps, 'open'>) {
  const { title, messageId, isConfirming, onCancel, ...rest } = useConfirmDialog(props);

  return (
    <Modal
      open
      title={title}
      role="alertdialog"
      descriptionId={messageId}
      dismissible={!isConfirming}
      onClose={onCancel}
      footer={<ConfirmDialogActions isConfirming={isConfirming} onCancel={onCancel} {...rest} />}
    >
      <ConfirmDialogForm messageId={messageId} {...rest} />
    </Modal>
  );
}

export function ConfirmDialog({ open, ...contentProps }: ConfirmDialogProps) {
  if (!open) return null;
  return <ConfirmDialogContent {...contentProps} />;
}
