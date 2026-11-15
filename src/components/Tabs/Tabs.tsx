import { type KeyboardEvent, type ReactNode, useId } from 'react';

import { cn } from '@/utils/cn';

import styles from './Tabs.module.css';

export interface TabItem<TId extends string = string> {
  id: TId;
  label: ReactNode;
  count?: number;
}

/** `TId` deixa a tela receber o id já com o tipo das abas dela, sem conferir nem converter. */
interface TabsProps<TId extends string> {
  label: string;
  items: TabItem<TId>[];
  activeId: TId;
  onChange: (id: TId) => void;
  children: ReactNode;
  actions?: ReactNode;
}

const stepByKey: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

function nextIndex(key: string, current: number, total: number): number | undefined {
  if (key === 'Home') return 0;
  if (key === 'End') return total - 1;
  const step = stepByKey[key];
  return step === undefined ? undefined : (current + step + total) % total;
}

interface TabButtonProps<TId extends string> {
  item: TabItem<TId>;
  tabId: string;
  panelId: string;
  active: boolean;
  onSelect: (id: TId) => void;
}

function TabCount({ count }: { count?: number }) {
  if (count === undefined) return null;

  return (
    <>
      {' '}
      <span className={styles.count}>{count}</span>
    </>
  );
}

function TabButton<TId extends string>({
  item,
  tabId,
  panelId,
  active,
  onSelect,
}: TabButtonProps<TId>) {
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
      <TabCount count={item.count} />
    </button>
  );
}

interface KeyboardNavigationOptions<TId extends string> {
  items: TabItem<TId>[];
  activeId: TId;
  onChange: (id: TId) => void;
  tabIdOf: (id: string) => string;
}

function keyboardNavigation<TId extends string>({
  items,
  activeId,
  onChange,
  tabIdOf,
}: KeyboardNavigationOptions<TId>) {
  const activeIndex = items.findIndex((item) => item.id === activeId);

  return (event: KeyboardEvent<HTMLDivElement>) => {
    const target = items[nextIndex(event.key, activeIndex, items.length) ?? -1];
    if (!target) return;
    event.preventDefault();
    onChange(target.id);
    document.getElementById(tabIdOf(target.id))?.focus();
  };
}

interface TabPanelProps {
  id: string;
  labelledBy: string;
  children: ReactNode;
}

function TabPanel({ id, labelledBy, children }: TabPanelProps) {
  return (
    <div id={id} role="tabpanel" aria-labelledby={labelledBy} tabIndex={0} className={styles.panel}>
      {children}
    </div>
  );
}

interface TabListProps<TId extends string> extends Omit<TabsProps<TId>, 'children' | 'actions'> {
  panelId: string;
  tabIdOf: (id: string) => string;
}

function TabList<TId extends string>({
  label,
  items,
  activeId,
  onChange,
  panelId,
  tabIdOf,
}: TabListProps<TId>) {
  const moveFocus = keyboardNavigation({ items, activeId, onChange, tabIdOf });

  return (
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
  );
}

export function Tabs<TId extends string>({ children, actions, ...listProps }: TabsProps<TId>) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const tabIdOf = (id: string) => `${baseId}-tab-${id}`;

  return (
    <div className={styles.tabs}>
      <div className={styles.bar}>
        <TabList {...listProps} panelId={panelId} tabIdOf={tabIdOf} />
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <TabPanel id={panelId} labelledBy={tabIdOf(listProps.activeId)}>
        {children}
      </TabPanel>
    </div>
  );
}
