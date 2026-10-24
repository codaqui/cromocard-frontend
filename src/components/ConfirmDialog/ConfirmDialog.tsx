import { type ReactNode, useId } from 'react';

import { Button } from '@/components/Button/Button';
import { Modal } from '@/components/Modal/Modal';
import { Textarea } from '@/components/Textarea/Textarea';

import styles from './ConfirmDialog.module.css';
import { useConfirmReasonForm } from './useConfirmReasonForm';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  requireReason?: boolean;
  reasonLabel?: string;
  isConfirming?: boolean;
  errorMessage?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

type ConfirmDialogContentProps = Omit<ConfirmDialogProps, 'open'>;

interface ConfirmDialogActionsProps {
  formId: string;
  confirmLabel: string;
  tone: 'primary' | 'danger';
  isConfirming: boolean;
  onCancel: () => void;
}

function ConfirmDialogActions({
  formId,
  confirmLabel,
  tone,
  isConfirming,
  onCancel,
}: ConfirmDialogActionsProps) {
  return (
    <>
      <Button variant="secondary" disabled={isConfirming} onClick={onCancel}>
        Cancelar
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

function ConfirmDialogContent(props: ConfirmDialogContentProps) {
  const { tone = 'primary', requireReason = false, reasonLabel = 'Motivo' } = props;
  const { isConfirming = false, errorMessage, onCancel } = props;
  const formId = useId();
  const { register, errors, submit } = useConfirmReasonForm(requireReason, props.onConfirm);
  const actions = { formId, confirmLabel: props.confirmLabel, tone, isConfirming, onCancel };

  return (
    <Modal
      open
      title={props.title}
      onClose={onCancel}
      footer={<ConfirmDialogActions {...actions} />}
    >
      <form id={formId} className={styles.form} noValidate onSubmit={submit}>
        <div className={styles.message}>{props.message}</div>
        {requireReason && (
          <Textarea label={reasonLabel} error={errors.reason?.message} {...register('reason')} />
        )}
        <ConfirmDialogError message={errorMessage} />
      </form>
    </Modal>
  );
}

export function ConfirmDialog({ open, ...contentProps }: ConfirmDialogProps) {
  if (!open) return null;
  return <ConfirmDialogContent {...contentProps} />;
}
