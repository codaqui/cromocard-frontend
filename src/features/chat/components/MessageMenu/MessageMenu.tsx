import { useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';

import { chatTexts } from '../../chat.labels';
import styles from './MessageMenu.module.css';

interface MessageMenuProps {
  mine: boolean;
  onReply: () => void;
  onClose: () => void;
}

function useDismiss(onClose: () => void) {
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    menu.current?.querySelector('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointer = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [onClose]);
  return menu;
}

export function MessageMenu({ mine, onReply, onClose }: MessageMenuProps) {
  const menu = useDismiss(onClose);
  return (
    <div
      ref={menu}
      role="menu"
      aria-label={chatTexts.messageActions}
      className={cn(styles.menu, mine && styles.mine)}
    >
      <button type="button" role="menuitem" className={styles.item} onClick={onReply}>
        <span aria-hidden="true">↩</span>
        {chatTexts.reply}
      </button>
    </div>
  );
}
