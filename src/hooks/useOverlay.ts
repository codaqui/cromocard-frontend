import { useEffect, useEffectEvent, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function keepFocusInside(event: KeyboardEvent, container: HTMLElement) {
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;

  const active = document.activeElement;
  const leavingBackward = event.shiftKey && (active === first || active === container);
  const leavingForward = !event.shiftKey && active === last;
  if (!leavingBackward && !leavingForward) return;

  event.preventDefault();
  (leavingBackward ? last : first).focus();
}

export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'Tab' && containerRef.current) keepFocusInside(event, containerRef.current);
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    containerRef.current?.focus();
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
      previouslyFocused?.focus();
    };
  }, [open]);

  return containerRef;
}
