import { useEffect, useEffectEvent } from 'react';

import { cn } from '@/utils/cn';

import styles from './Toast.module.css';

type ToastTone = 'success' | 'danger';

interface ToastProps {
  message: string | null;
  /** Segunda linha do aviso, como no Figma: "Charizard foi publicada e já aparece nas buscas." */
  detail?: string;
  tone?: ToastTone;
  durationMs?: number;
  onDismiss: () => void;
}

const DEFAULT_DURATION_MS = 5000;

interface ToastMessageProps {
  message: string;
  detail?: string;
  tone: ToastTone;
  onDismiss: () => void;
}

function ToastMessage({ message, detail, tone, onDismiss }: ToastMessageProps) {
  return (
    <div className={cn(styles.toast, styles[tone])}>
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
  detail,
  tone = 'success',
  durationMs = DEFAULT_DURATION_MS,
  onDismiss,
}: ToastProps) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => dismiss(), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs]);

  return (
    <div className={styles.region} role={tone === 'danger' ? 'alert' : 'status'}>
      {message && (
        <ToastMessage message={message} detail={detail} tone={tone} onDismiss={onDismiss} />
      )}
    </div>
  );
}
