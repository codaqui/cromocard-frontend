import { Link } from 'react-router';

import { Icon } from '@/components/Icon/Icon';
import { paths } from '@/routes/paths';

import { notificationsTexts as t } from '../../notifications.labels';
import styles from './NotificationsHeader.module.css';

function HeaderChips({ unread }: { unread?: number }) {
  return (
    <ul className={styles.chips} aria-label="Resumo">
      {unread !== undefined && (
        <li className={styles.unreadChip}>
          <span className={styles.dot} aria-hidden="true" />
          {t.unread(unread)}
        </li>
      )}
      <li className={styles.chip}>
        <Icon name="bookmark" size={14} />
        {t.saved}
      </li>
    </ul>
  );
}

function HeaderActions() {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.action} disabled>
        <Icon name="doneAll" size={20} />
        {t.markAllAsRead}
      </button>
      <Link to={paths.settings} className={styles.action}>
        <Icon name="tune" size={20} />
        {t.configureAlerts}
      </Link>
    </div>
  );
}

export function NotificationsHeader({ unread }: { unread?: number }) {
  return (
    <header className={styles.header}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>
          <Icon name="terminal" size={16} />
          {t.eyebrow}
        </p>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.description}>{t.description}</p>
        <HeaderChips unread={unread} />
      </div>
      <HeaderActions />
    </header>
  );
}
