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
  /** Linha de apoio abaixo do título, como nos formulários do catálogo no Figma. */
  subtitle?: string;
  /**
   * `wide` para formulários de duas colunas (48rem), como o cadastro de usuário no Figma;
   * `large` para formulários com dois painéis (64rem), como o cadastro de carta.
   */
  size?: DialogSize;
}

interface OverlayDialogWithPlacementProps extends OverlayDialogProps {
  placement: 'center' | 'right';
}

type DialogSize = 'default' | 'wide' | 'large';

const keepOpen = () => undefined;

const closeOnBackdropClick = (onClose: () => void) => (event: MouseEvent) =>
  event.target === event.currentTarget && onClose();

interface DialogHeaderProps {
  titleId: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  dismissible: boolean;
  onClose: () => void;
}

function DialogTitles({
  titleId,
  title,
  subtitle,
}: Pick<DialogHeaderProps, 'titleId' | 'title' | 'subtitle'>) {
  return (
    <div className={styles.titles}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

function DialogHeader({ titleId, title, subtitle, icon, dismissible, onClose }: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        {icon && (
          <span className={styles.headerIcon} aria-hidden="true">
            <Icon name={icon} size={22} />
          </span>
        )}
        <DialogTitles titleId={titleId} title={title} subtitle={subtitle} />
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

const sizeClassName: Record<DialogSize, string | undefined> = {
  default: undefined,
  wide: styles.wideDialog,
  large: styles.largeDialog,
};

function dialogClassName(placement: 'center' | 'right', size: DialogSize) {
  return cn(styles.dialog, styles[`${placement}Dialog`], sizeClassName[size]);
}

function DialogPanel({
  ref,
  titleId,
  placement,
  role = 'dialog',
  size = 'default',
  ...content
}: DialogPanelProps) {
  const { title, subtitle, icon, dismissible, onClose, children, footer } = content;

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
      <DialogHeader {...{ titleId, title, subtitle, icon, dismissible, onClose }} />
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
