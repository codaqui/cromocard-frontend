import { useEffect, useEffectEvent } from 'react';

import { cn } from '@/utils/cn';

import styles from './Toast.module.css';

type ToastTone = 'success' | 'error';

interface ToastProps {
  message: string | null;
  tone?: ToastTone;
  durationMs?: number;
  onDismiss: () => void;
}

const DEFAULT_DURATION_MS = 5000;

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

  if (!message) return null;

  return (
    <div className={cn(styles.toast, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <button type="button" className={styles.close} aria-label="Fechar aviso" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
