import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog';

interface RejectDialogProps {
  open: boolean;
  sellerName: string;
  isConfirming: boolean;
  errorMessage?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectDialog({
  open,
  sellerName,
  isConfirming,
  errorMessage,
  onConfirm,
  onCancel,
}: RejectDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Rejeitar credenciamento"
      message={`${sellerName} não poderá vender na plataforma e receberá o motivo da rejeição.`}
      confirmLabel="Rejeitar"
      tone="danger"
      requireReason
      reasonLabel="Motivo da rejeição"
      isConfirming={isConfirming}
      errorMessage={errorMessage}
      onConfirm={(reason) => reason && onConfirm(reason)}
      onCancel={onCancel}
    />
  );
}
