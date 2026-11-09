import {
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Icon } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/icon-paths';
import { cn } from '@/utils/cn';

import styles from './UserMenu.module.css';

export interface UserMenuAction {
  label: string;
  icon: IconName;
  onSelect: () => void;
}

interface UserMenuIdentity {
  name: string;
  caption?: string;
  initial?: string;
  avatarFirst?: boolean;
}

interface UserMenuProps extends UserMenuIdentity {
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
    const onKeyDown = (event: globalThis.KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  return ref;
}

const ARROW_STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

function moveFocus(menu: HTMLElement, event: KeyboardEvent) {
  const step = ARROW_STEPS[event.key];
  if (!step) return;
  event.preventDefault();
  const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const current = items.findIndex((item) => item === document.activeElement);
  items.at((current + step) % items.length)?.focus();
}

interface UserMenuListProps {
  id: string;
  actions: UserMenuAction[];
  close: () => void;
}

function UserMenuItem({ action, close }: { action: UserMenuAction; close: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={styles.item}
      onClick={() => {
        close();
        action.onSelect();
      }}
    >
      <Icon name={action.icon} />
      {action.label}
    </button>
  );
}

function UserMenuList({ id, actions, close }: UserMenuListProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  useFocusFirstItem(menuRef);

  return (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      className={styles.menu}
      onKeyDown={(event) => menuRef.current && moveFocus(menuRef.current, event)}
    >
      {actions.map((action) => (
        <UserMenuItem key={action.label} action={action} close={close} />
      ))}
    </div>
  );
}

function useFocusFirstItem(menuRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [menuRef]);
}

interface UserMenuTriggerProps {
  identity: UserMenuIdentity;
  isOpen: boolean;
  menuId: string;
  onToggle: () => void;
}

function UserMenuTrigger({ identity, isOpen, menuId, onToggle }: UserMenuTriggerProps) {
  const { name, caption, initial, avatarFirst } = identity;

  return (
    <button
      type="button"
      className={cn(styles.trigger, avatarFirst && styles.avatarFirst)}
      aria-label={name}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={menuId}
      onClick={onToggle}
    >
      <span className={styles.avatar} aria-hidden="true">
        {initial ?? <Icon name="person" size={18} />}
      </span>
      <span className={styles.identity}>
        <span className={styles.name}>{name}</span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </span>
    </button>
  );
}

export function UserMenu({ actions, ...identity }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useDismiss(isOpen, close);
  const menuId = useId();

  return (
    <div ref={ref} className={styles.root}>
      <UserMenuTrigger
        identity={identity}
        isOpen={isOpen}
        menuId={menuId}
        onToggle={() => setIsOpen((open) => !open)}
      />
      {isOpen && <UserMenuList id={menuId} actions={actions} close={close} />}
    </div>
  );
}
