import { useState } from 'react';
import { Link } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { paths } from '@/routes/paths';
import { cn } from '@/utils/cn';

import { useOpenNotification } from '../../hooks/useOpenNotification';
import { bellFilters, notificationsTexts as t } from '../../notifications.labels';
import { useNotifications } from '../../notifications.queries';
import type {
  Notification,
  NotificationCounts,
  NotificationFilter,
} from '../../notifications.types';
import { BellItem } from './BellItem';
import styles from './NotificationBell.module.css';

export const BELL_LIMIT = 4;

interface BellPanelProps {
  id: string;
  counts?: NotificationCounts;
  close: () => void;
}

function BellFilters({
  active,
  counts,
  onChange,
}: {
  active: NotificationFilter;
  counts?: NotificationCounts;
  onChange: (filter: NotificationFilter) => void;
}) {
  return (
    <div className={styles.filters} role="group" aria-label="Filtrar notificações">
      {bellFilters.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={value === active}
          className={cn(styles.filter, value === active && styles.activeFilter)}
          onClick={() => onChange(value)}
        >
          {counts ? `${label} (${counts[value]})` : label}
        </button>
      ))}
    </div>
  );
}

function BellList({
  filter,
  onOpen,
}: {
  filter: NotificationFilter;
  onOpen: (notification: Notification) => void;
}) {
  const query = useNotifications(filter, BELL_LIMIT);
  if (query.isPending) return <LoadingState message={t.loading} />;
  if (query.isError) return <p className={styles.empty}>{t.loadError}</p>;
  const items = query.data.pages[0]?.data ?? [];
  if (items.length === 0) return <p className={styles.empty}>{t.empty}</p>;
  return (
    <ul className={styles.list}>
      {items.map((notification) => (
        <BellItem key={notification.id} notification={notification} onOpen={onOpen} />
      ))}
    </ul>
  );
}

function PanelHeader({ counts }: { counts?: NotificationCounts }) {
  return (
    <div className={styles.panelHeader}>
      <h2 className={styles.panelTitle}>{t.bellTitle}</h2>
      {counts && counts.UNREAD > 0 && (
        <span className={styles.newBadge}>{t.bellNew(counts.UNREAD)}</span>
      )}
      <button type="button" className={styles.markAll} disabled>
        {t.markAllAsRead}
      </button>
    </div>
  );
}

function PanelFooter({ close }: { close: () => void }) {
  return (
    <div className={styles.panelFooter}>
      <Link to={paths.notifications} className={styles.seeAll} onClick={close}>
        {t.seeAll}
      </Link>
      <Link to={paths.settings} className={styles.configure} onClick={close}>
        {t.configureAlertsShort}
      </Link>
    </div>
  );
}

export function BellPanel({ id, counts, close }: BellPanelProps) {
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const { open } = useOpenNotification();
  const openAndClose = (notification: Notification) => {
    close();
    open(notification);
  };
  return (
    <div id={id} role="dialog" aria-label={t.bellTitle} className={styles.panel}>
      <PanelHeader counts={counts} />
      <BellFilters active={filter} counts={counts} onChange={setFilter} />
      <BellList filter={filter} onOpen={openAndClose} />
      <PanelFooter close={close} />
    </div>
  );
}
