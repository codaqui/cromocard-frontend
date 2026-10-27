import { useEffect, useEffectEvent } from 'react';

import { cn } from '@/utils/cn';

import styles from './Toast.module.css';

type ToastTone = 'success' | 'danger';

interface ToastProps {
  message: string | null;
  tone?: ToastTone;
  durationMs?: number;
  onDismiss: () => void;
}

const DEFAULT_DURATION_MS = 5000;

interface ToastMessageProps {
  message: string;
  tone: ToastTone;
  onDismiss: () => void;
}

function ToastMessage({ message, tone, onDismiss }: ToastMessageProps) {
  return (
    <div className={cn(styles.toast, styles[tone])}>
      <span>{message}</span>
      <button type="button" className={styles.close} aria-label="Fechar aviso" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export function Toast({
  message,
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
      {message && <ToastMessage message={message} tone={tone} onDismiss={onDismiss} />}
    </div>
  );
}
