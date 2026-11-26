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
  /** Um `IconName` entra no quadro padrão à esquerda do título; qualquer outro nó renderiza como veio, para ícones com estilo próprio (como o selo colorido por gravidade dos diálogos de moderação). */
  icon?: IconName | Exclude<ReactNode, string>;
  /** Linha de apoio acima do título, como nos diálogos de moderação do Figma. */
  eyebrow?: ReactNode;
  /** Linha de apoio abaixo do título, como nos formulários do catálogo no Figma. */
  subtitle?: string;
  /**
   * `narrow` (35rem) para os modais do chat, como o de bloquear ou denunciar (1160-34298);
   * `wide` para formulários de duas colunas (48rem), como o cadastro de usuário no Figma;
   * `large` para formulários com dois painéis (64rem), como o cadastro de carta.
   */
  size?: DialogSize;
  /**
   * `framed`: cabeçalho e rodapé em faixas separadas, como os formulários do catálogo no Figma;
   * `compact`: modal pequeno, com borda e sem o botão de fechar, como os avisos do catálogo;
   * `dense`: faixas de cabeçalho e rodapé mais baixas e título de 18 px, como os modais do chat.
   */
  variant?: DialogVariant;
}

interface OverlayDialogWithPlacementProps extends OverlayDialogProps {
  placement: 'center' | 'right';
}

type DialogSize = 'default' | 'narrow' | 'medium' | 'wide' | 'large';

type DialogVariant = 'default' | 'framed' | 'compact' | 'dense';

const keepOpen = () => undefined;

const closeOnBackdropClick = (onClose: () => void) => (event: MouseEvent) =>
  event.target === event.currentTarget && onClose();

interface DialogHeaderProps extends Pick<OverlayDialogProps, 'title' | 'icon' | 'eyebrow'> {
  titleId: string;
  subtitle?: string;
  dismissible: boolean;
  /** O modal compacto do Figma não tem o botão de fechar: fecha pelos botões ou pelo Esc. */
  closable: boolean;
  onClose: () => void;
}

function isIconName(icon: OverlayDialogProps['icon']): icon is IconName {
  return typeof icon === 'string';
}

function DialogIcon({ icon }: Pick<DialogHeaderProps, 'icon'>) {
  if (!icon) return null;
  if (isIconName(icon)) {
    return (
      <span className={styles.headerIcon} aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
    );
  }
  return icon;
}

function DialogTitles({
  titleId,
  title,
  subtitle,
  eyebrow,
}: Pick<DialogHeaderProps, 'titleId' | 'title' | 'subtitle' | 'eyebrow'>) {
  return (
    <div className={styles.titles}>
      {eyebrow}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}

function CloseButton({ dismissible, onClose }: Pick<DialogHeaderProps, 'dismissible' | 'onClose'>) {
  return (
    <button
      type="button"
      className={styles.close}
      aria-label="Fechar"
      disabled={!dismissible}
      onClick={onClose}
    >
      ×
    </button>
  );
}

function DialogHeader({
  titleId,
  title,
  subtitle,
  icon,
  eyebrow,
  closable,
  ...close
}: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <DialogIcon icon={icon} />
        <DialogTitles titleId={titleId} title={title} subtitle={subtitle} eyebrow={eyebrow} />
      </div>
      {closable && <CloseButton {...close} />}
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
  narrow: styles.narrowDialog,
  medium: styles.mediumDialog,
  wide: styles.wideDialog,
  large: styles.largeDialog,
};

const variantClassName: Record<DialogVariant, string | undefined> = {
  default: undefined,
  framed: styles.framedDialog,
  compact: styles.compactDialog,
  dense: cn(styles.framedDialog, styles.denseDialog),
};

interface DialogLook {
  placement: 'center' | 'right';
  size: DialogSize;
  variant: DialogVariant;
}

function dialogClassName({ placement, size, variant }: DialogLook) {
  return cn(
    styles.dialog,
    styles[`${placement}Dialog`],
    variantClassName[variant],
    sizeClassName[size],
  );
}

function DialogPanel({
  ref,
  titleId,
  placement,
  role = 'dialog',
  size = 'default',
  variant = 'default',
  ...content
}: DialogPanelProps) {
  return (
    <div
      ref={ref}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={content.descriptionId}
      tabIndex={-1}
      className={dialogClassName({ placement, size, variant })}
    >
      <DialogHeader {...content} titleId={titleId} closable={variant !== 'compact'} />
      <div className={styles.body}>{content.children}</div>
      {content.footer && <footer className={styles.footer}>{content.footer}</footer>}
    </div>
  );
}

/** O modal compacto do Figma escurece o fundo sem desfocar. */
function overlayClassName({
  placement,
  variant,
}: Pick<OverlayDialogWithPlacementProps, 'placement' | 'variant'>) {
  return cn(styles.overlay, styles[placement], variant === 'compact' && styles.sharpOverlay);
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
    <div className={overlayClassName(panel)} onMouseDown={closeOnBackdropClick(close)}>
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
