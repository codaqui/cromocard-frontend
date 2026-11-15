import { type MouseEvent, type ReactNode, type Ref, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
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
  /** Ícone num quadro à esquerda do título, como nos modais do Figma. */
  icon?: IconName;
  /** `wide` para formulários de duas colunas (48rem), como o cadastro de usuário no Figma. */
  size?: 'default' | 'wide';
}

interface OverlayDialogWithPlacementProps extends OverlayDialogProps {
  placement: 'center' | 'right';
}

const keepOpen = () => undefined;

const closeOnBackdropClick = (onClose: () => void) => (event: MouseEvent) =>
  event.target === event.currentTarget && onClose();

interface DialogHeaderProps {
  titleId: string;
  title: string;
  icon?: IconName;
  dismissible: boolean;
  onClose: () => void;
}

function DialogHeader({ titleId, title, icon, dismissible, onClose }: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        {icon && (
          <span className={styles.headerIcon} aria-hidden="true">
            <Icon name={icon} size={22} />
          </span>
        )}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
      </div>
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

function dialogClassName(placement: 'center' | 'right', size: 'default' | 'wide') {
  return cn(styles.dialog, styles[`${placement}Dialog`], size === 'wide' && styles.wideDialog);
}

function DialogPanel({
  ref,
  titleId,
  placement,
  role = 'dialog',
  size = 'default',
  ...content
}: DialogPanelProps) {
  const { title, icon, dismissible, onClose, children, footer } = content;

  return (
    <div
      ref={ref}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={content.descriptionId}
      tabIndex={-1}
      className={dialogClassName(placement, size)}
    >
      <DialogHeader {...{ titleId, title, icon, dismissible, onClose }} />
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
