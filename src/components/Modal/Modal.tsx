import { OverlayDialog, type OverlayDialogProps } from '@/components/OverlayDialog/OverlayDialog';

export function Modal(props: OverlayDialogProps) {
  return <OverlayDialog {...props} placement="center" />;
}
