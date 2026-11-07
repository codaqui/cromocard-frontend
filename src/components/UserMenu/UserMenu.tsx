import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';

import styles from './UserMenu.module.css';

export interface UserMenuAction {
  label: string;
  icon: IconName;
  onSelect: () => void;
}

interface UserMenuProps {
  name: string;
  caption: string;
  actions: UserMenuAction[];
}

function useDismiss(isOpen: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);

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

function UserMenuItems({ actions, close }: { actions: UserMenuAction[]; close: () => void }) {
  return actions.map(({ label, icon, onSelect }) => (
    <button
      key={label}
      type="button"
      className={styles.item}
      onClick={() => {
        close();
        onSelect();
      }}
    >
      <Icon name={icon} />
      {label}
    </button>
  ));
}

interface UserMenuTriggerProps {
  name: string;
  caption: string;
  isOpen: boolean;
  menuId: string;
  onToggle: () => void;
}

function UserMenuTrigger({ name, caption, isOpen, menuId, onToggle }: UserMenuTriggerProps) {
  return (
    <button
      type="button"
      className={styles.trigger}
      aria-expanded={isOpen}
      aria-controls={menuId}
      onClick={onToggle}
    >
      <span className={styles.identity}>
        <span className={styles.name}>{name}</span>
        <span className={styles.caption}>{caption}</span>
      </span>
      <span className={styles.avatar} aria-hidden="true">
        <Icon name="person" size={18} />
      </span>
      <Icon name="expandMore" />
    </button>
  );
}

export function UserMenu({ name, caption, actions }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useDismiss(isOpen, close);
  const menuId = useId();

  return (
    <div ref={ref} className={styles.root}>
      <UserMenuTrigger
        name={name}
        caption={caption}
        isOpen={isOpen}
        menuId={menuId}
        onToggle={() => setIsOpen((open) => !open)}
      />
      {isOpen && (
        <div id={menuId} className={styles.menu}>
          <UserMenuItems actions={actions} close={close} />
        </div>
      )}
    </div>
  );
}
