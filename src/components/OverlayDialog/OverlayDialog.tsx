import { type MouseEvent, type ReactNode, type Ref, useId } from 'react';

import { useOverlay } from '@/hooks/useOverlay';
import { cn } from '@/utils/cn';

import styles from './OverlayDialog.module.css';

export interface OverlayDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

interface OverlayDialogWithPlacementProps extends OverlayDialogProps {
  placement: 'center' | 'right';
}

const closeOnBackdropClick = (onClose: () => void) => (event: MouseEvent) =>
  event.target === event.currentTarget && onClose();

interface DialogHeaderProps {
  titleId: string;
  title: string;
  onClose: () => void;
}

function DialogHeader({ titleId, title, onClose }: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <button type="button" className={styles.close} aria-label="Fechar" onClick={onClose}>
        ×
      </button>
    </header>
  );
}

interface DialogPanelProps extends Omit<OverlayDialogWithPlacementProps, 'open'> {
  ref: Ref<HTMLDivElement>;
  titleId: string;
}

function DialogPanel({
  ref,
  titleId,
  placement,
  title,
  onClose,
  children,
  footer,
}: DialogPanelProps) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(styles.dialog, styles[`${placement}Dialog`])}
    >
      <DialogHeader titleId={titleId} title={title} onClose={onClose} />
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}

export function OverlayDialog({
  open,
  onClose,
  placement,
  ...panel
}: OverlayDialogWithPlacementProps) {
  const titleId = useId();
  const dialogRef = useOverlay<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div
      className={cn(styles.overlay, styles[placement])}
      onMouseDown={closeOnBackdropClick(onClose)}
    >
      <DialogPanel
        ref={dialogRef}
        titleId={titleId}
        placement={placement}
        onClose={onClose}
        {...panel}
      />
    </div>
  );
}
