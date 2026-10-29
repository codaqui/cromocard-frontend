import { useEffect, useEffectEvent, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const openOverlays: symbol[] = [];

const isTopOverlay = (overlay: symbol) => openOverlays.at(-1) === overlay;

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

let pageOverflowBeforeOverlays = '';

function trackOverlay(overlay: symbol) {
  if (openOverlays.length === 0) {
    pageOverflowBeforeOverlays = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openOverlays.push(overlay);

  return () => {
    openOverlays.splice(openOverlays.indexOf(overlay), 1);
    if (openOverlays.length === 0) document.body.style.overflow = pageOverflowBeforeOverlays;
  };
}

export function useOverlay<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'Tab' && containerRef.current) keepFocusInside(event, containerRef.current);
  });

  useEffect(() => {
    if (!open) return;
    const overlay = Symbol('overlay');
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const listener = (event: KeyboardEvent) => isTopOverlay(overlay) && handleKeyDown(event);
    const untrack = trackOverlay(overlay);
    containerRef.current?.focus();
    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
      untrack();
      previouslyFocused?.focus();
    };
  }, [open]);

  return containerRef;
}
