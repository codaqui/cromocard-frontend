import { useEffect, useRef } from 'react';

export function useDismiss<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  close: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && ref.current?.contains(event.target)) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  return ref;
}
