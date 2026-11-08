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
  dismissible?: boolean;
  role?: 'dialog' | 'alertdialog';
  descriptionId?: string;
  icon?: ReactNode;
  eyebrow?: ReactNode;
}

interface OverlayDialogWithPlacementProps extends OverlayDialogProps {
  placement: 'center' | 'right';
}

const keepOpen = () => undefined;

const closeOnBackdropClick = (onClose: () => void) => (event: MouseEvent) =>
  event.target === event.currentTarget && onClose();

interface DialogHeaderProps extends Pick<OverlayDialogProps, 'title' | 'icon' | 'eyebrow'> {
  titleId: string;
  dismissible: boolean;
  onClose: () => void;
}

function DialogHeading({
  titleId,
  title,
  icon,
  eyebrow,
}: Omit<DialogHeaderProps, 'dismissible' | 'onClose'>) {
  return (
    <div className={styles.heading}>
      {icon}
      <div>
        {eyebrow}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </div>
    </div>
  );
}

function DialogHeader({ dismissible, onClose, ...heading }: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <DialogHeading {...heading} />
      <button
        type="button"
        className={styles.close}
        aria-label="Fechar"
        disabled={!dismissible}
        onClick={onClose}
      >
        ×
      </button>
    </header>
  );
}

interface DialogPanelProps extends Omit<OverlayDialogWithPlacementProps, 'open'> {
  ref: Ref<HTMLDivElement>;
  titleId: string;
  dismissible: boolean;
}

function DialogPanel({ ref, titleId, placement, role = 'dialog', ...content }: DialogPanelProps) {
  const { title, icon, eyebrow, dismissible, onClose, children, footer } = content;
  const heading = { titleId, title, icon, eyebrow };

  return (
    <div
      ref={ref}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={content.descriptionId}
      tabIndex={-1}
      className={cn(styles.dialog, styles[`${placement}Dialog`])}
    >
      <DialogHeader {...heading} dismissible={dismissible} onClose={onClose} />
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}

export function OverlayDialog({
  open,
  dismissible = true,
  ...panel
}: OverlayDialogWithPlacementProps) {
  const titleId = useId();
  const close = dismissible ? panel.onClose : keepOpen;
  const dialogRef = useOverlay<HTMLDivElement>(open, close);

  if (!open) return null;

  return (
    <div
      className={cn(styles.overlay, styles[panel.placement])}
      onMouseDown={closeOnBackdropClick(close)}
    >
      <DialogPanel
        {...panel}
        ref={dialogRef}
        titleId={titleId}
        dismissible={dismissible}
        onClose={close}
      />
    </div>
  );
}
