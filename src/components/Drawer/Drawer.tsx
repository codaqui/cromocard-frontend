import { OverlayDialog, type OverlayDialogProps } from '@/components/OverlayDialog/OverlayDialog';

export function Drawer(props: OverlayDialogProps) {
  return <OverlayDialog {...props} placement="right" />;
}
