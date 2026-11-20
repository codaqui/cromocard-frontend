import { useEffect, useEffectEvent } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { cn } from '@/utils/cn';

import styles from './Toast.module.css';

type ToastTone = 'success' | 'danger';

type ToastPlacement = 'top' | 'bottom';

interface ToastProps {
  message: string | null;
  /** Segunda linha do aviso, como no Figma: "Charizard foi publicada e já aparece nas buscas." */
  detail?: string;
  tone?: ToastTone;
  /** `top`: no alto, à direita, abaixo da barra, como no frame 832-1149. */
  placement?: ToastPlacement;
  tinted?: boolean;
  durationMs?: number;
  onDismiss: () => void;
}

const DEFAULT_DURATION_MS = 5000;

const toneIcon = { success: 'check', danger: 'errorCircle' } as const;

interface ToastMessageProps {
  message: string;
  detail?: string;
  tone?: ToastTone;
  tinted?: boolean;
  onDismiss: () => void;
}

/** Com a segunda linha, o aviso vira o cartão do Figma: ícone, borda na cor do tom e título claro. */
function ToastMessage({
  message,
  detail,
  tone = 'success',
  tinted = false,
  onDismiss,
}: ToastMessageProps) {
  return (
    <div className={cn(styles.toast, styles[tone], detail && styles.card, tinted && styles.tinted)}>
      {detail && (
        <span className={styles.icon} aria-hidden="true">
          <Icon name={toneIcon[tone]} size={20} />
        </span>
      )}
      <span className={styles.text}>
        <span className={detail && styles.title}>{message}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </span>
      <button type="button" className={styles.close} aria-label="Fechar aviso" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export function Toast({
  message,
  placement = 'bottom',
  durationMs = DEFAULT_DURATION_MS,
  onDismiss,
  ...look
}: ToastProps) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => dismiss(), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

  return (
    <div
      className={cn(styles.region, styles[placement])}
      role={look.tone === 'danger' ? 'alert' : 'status'}
    >
      {message && <ToastMessage message={message} {...look} onDismiss={onDismiss} />}
    </div>
  );
}
