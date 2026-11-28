import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { paths } from '@/routes/paths';

import { notificationsTexts as t } from '../../notifications.labels';
import styles from './NotificationTabs.module.css';

export function NotificationTabs({ unread }: { unread?: number }) {
  return (
    <nav className={styles.tabs} aria-label="Notificações e favoritos">
      <Link to={paths.notifications} className={styles.active} aria-current="page">
        <Icon name="notificationsActive" size={20} />
        {t.centralTab}
        {unread !== undefined && ' '}
        {unread !== undefined && <span className={styles.count}>{unread}</span>}
      </Link>
      <Link to={paths.favorites} className={styles.tab}>
        <Icon name="starOutline" size={20} />
        {t.favoritesTab}
      </Link>
    </nav>
  );
}
