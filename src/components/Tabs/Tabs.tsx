import { type KeyboardEvent, type ReactNode, useId } from 'react';

import { cn } from '@/utils/cn';

import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: ReactNode;
}

interface TabsProps {
  label: string;
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

const stepByKey: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

function nextIndex(key: string, current: number, total: number): number | undefined {
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  const step = stepByKey[key];
  return step === undefined ? undefined : (current + step + total) % total;
}

interface TabButtonProps {
  item: TabItem;
  tabId: string;
  panelId: string;
  active: boolean;
  onSelect: (id: string) => void;
}

function TabButton({ item, tabId, panelId, active, onSelect }: TabButtonProps) {
  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      className={cn(styles.tab, active && styles.active)}
      onClick={() => onSelect(item.id)}
    >
      {item.label}
    </button>
  );
}

interface KeyboardNavigationOptions {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  tabIdOf: (id: string) => string;
}

function keyboardNavigation({ items, activeId, onChange, tabIdOf }: KeyboardNavigationOptions) {
  const activeIndex = items.findIndex((item) => item.id === activeId);

  return (event: KeyboardEvent<HTMLDivElement>) => {
    const target = items[nextIndex(event.key, activeIndex, items.length) ?? -1];
    if (!target) return;
    event.preventDefault();
    onChange(target.id);
    document.getElementById(tabIdOf(target.id))?.focus();
  };
}

export function Tabs({ label, items, activeId, onChange, children }: TabsProps) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const tabIdOf = (id: string) => `${baseId}-tab-${id}`;
  const moveFocus = keyboardNavigation({ items, activeId, onChange, tabIdOf });

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label={label} className={styles.list} onKeyDown={moveFocus}>
        {items.map((item) => (
          <TabButton
            key={item.id}
            item={item}
            tabId={tabIdOf(item.id)}
            panelId={panelId}
            active={item.id === activeId}
            onSelect={onChange}
          />
        ))}
      </div>
      <div id={panelId} role="tabpanel" aria-labelledby={tabIdOf(activeId)} tabIndex={0}>
        {children}
      </div>
    </div>
  );
}
