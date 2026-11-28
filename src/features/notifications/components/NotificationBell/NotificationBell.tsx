import { useCallback, useId, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { useDismiss } from '@/hooks/useDismiss';

import { notificationsTexts as t } from '../../notifications.labels';
import { useNotifications } from '../../notifications.queries';
import { BELL_LIMIT, BellPanel } from './BellPanel';
import styles from './NotificationBell.module.css';

interface BellButtonProps {
  className?: string;
  unread: number;
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
}

function BellButton({ className, unread, isOpen, panelId, onToggle }: BellButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={t.bellLabel(unread)}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={isOpen ? panelId : undefined}
      onClick={onToggle}
    >
      <Icon name="notifications" size={20} />
      {unread > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {unread}
        </span>
      )}
    </button>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  const ref = useDismiss(isOpen, close);
  const panelId = useId();
  const counts = useNotifications('ALL', BELL_LIMIT).data?.pages[0]?.meta.counts;
  return (
    <div ref={ref} className={styles.wrapper}>
      <BellButton
        className={className}
        unread={counts?.UNREAD ?? 0}
        isOpen={isOpen}
        panelId={panelId}
        onToggle={() => setIsOpen((open) => !open)}
      />
      {isOpen && <BellPanel id={panelId} counts={counts} close={close} />}
    </div>
  );
}
